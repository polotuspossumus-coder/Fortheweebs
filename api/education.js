/**
 * Education Platform API - Phase 4
 * Courses, tutorials, certifications, mentorship
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/education/courses
 * Browse available courses
 */
router.get('/courses', async (req, res) => {
    try {
        const { category, level, isFree, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('courses')
            .select('*, instructor:instructor_id(username, display_name, avatar_url, verified), enrollment_count, rating_avg')
            .eq('published', true)
            .order('enrollment_count', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (level) {
            query = query.eq('level', level);
        }

        if (isFree === 'true') {
            query = query.eq('price', 0);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            courses: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }
});

/**
 * GET /api/education/course/:courseId
 * Get course details
 */
router.get('/course/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        

        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select(`
                *,
                instructor:instructor_id(username, display_name, avatar_url, verified, bio),
                modules:course_modules(id, title, description, order_index, lesson_count),
                reviews:course_reviews(rating, comment, created_at, user:user_id(username, avatar_url))
            `)
            .eq('id', courseId)
            .single();

        if (courseError) throw courseError;

        // Check if user is enrolled
        let isEnrolled = false;
        let progress = null;

        if (userId) {
            const { data: enrollment } = await supabase
                .from('course_enrollments')
                .select('id, progress, completed_at')
                .eq('course_id', courseId)
                .eq('user_id', userId)
                .single();

            if (enrollment) {
                isEnrolled = true;
                progress = enrollment.progress;
            }
        }

        res.json({
            course,
            isEnrolled,
            progress
        });

    } catch (error) {
        console.error('Course details error:', error);
        res.status(500).json({ error: 'Failed to fetch course details', details: error.message });
    }
});

/**
 * POST /api/education/course/enroll
 * Enroll in a course
 */
router.post('/course/enroll', async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        if (!courseId || !userId) {
            return res.status(400).json({ error: 'courseId and userId required' });
        }

        // Check if already enrolled
        const { data: existing } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        // Get course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('price, instructor_id')
            .eq('id', courseId)
            .single();

        if (courseError) throw courseError;

        // If paid course, create payment intent
        if (course.price > 0) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: course.price,
                currency: 'usd',
                metadata: {
                    course_id: courseId,
                    user_id: userId,
                    instructor_id: course.instructor_id
                }
            });

            // Create pending enrollment
            const { data: enrollment, error: enrollError } = await supabase
                .from('course_enrollments')
                .insert({
                    course_id: courseId,
                    user_id: userId,
                    payment_intent_id: paymentIntent.id,
                    status: 'pending_payment',
                    progress: 0
                })
                .select()
                .single();

            if (enrollError) throw enrollError;

            return res.json({
                clientSecret: paymentIntent.client_secret,
                enrollmentId: enrollment.id,
                amount: course.price / 100,
                message: 'Complete payment to enroll'
            });
        }

        // Free course - enroll immediately
        const { data: enrollment, error: enrollError } = await supabase
            .from('course_enrollments')
            .insert({
                course_id: courseId,
                user_id: userId,
                status: 'active',
                progress: 0,
                enrolled_at: new Date().toISOString()
            })
            .select()
            .single();

        if (enrollError) throw enrollError;

        // Increment enrollment count
        await supabase.rpc('increment_course_enrollments', { course_id: courseId });

        res.json({
            enrollment,
            message: 'Successfully enrolled in course'
        });

    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ error: 'Failed to enroll in course', details: error.message });
    }
});

/**
 * POST /api/education/lesson/complete
 * Mark a lesson as completed
 */
router.post('/lesson/complete', async (req, res) => {
    try {
        const { userId, enrollmentId, lessonId } = req.body;

        if (!enrollmentId || !lessonId || !userId) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Record lesson completion
        const { data, error } = await supabase
            .from('lesson_completions')
            .insert({
                enrollment_id: enrollmentId,
                lesson_id: lessonId,
                user_id: userId,
                completed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            // Already completed
            if (error.code === '23505') {
                return res.json({ message: 'Lesson already marked as complete' });
            }
            throw error;
        }

        // Update enrollment progress
        await supabase.rpc('update_course_progress', { enrollment_id: enrollmentId });

        res.json({
            completion: data,
            message: 'Lesson marked as complete'
        });

    } catch (error) {
        console.error('Complete lesson error:', error);
        res.status(500).json({ error: 'Failed to mark lesson complete', details: error.message });
    }
});

/**
 * GET /api/education/my-courses/:userId
 * Get user's enrolled courses
 */
router.get('/my-courses/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status = 'active' } = req.query;

        const { data, error } = await supabase
            .from('course_enrollments')
            .select(`
                *,
                course:course_id(title, thumbnail_url, instructor:instructor_id(username, display_name))
            `)
            .eq('user_id', userId)
            .eq('status', status)
            .order('enrolled_at', { ascending: false });

        if (error) throw error;

        res.json({
            enrollments: data
        });

    } catch (error) {
        console.error('My courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }
});

/**
 * GET /api/education/tutorials
 * Browse free tutorials
 */
router.get('/tutorials', async (req, res) => {
    try {
        const { topic, difficulty, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('tutorials')
            .select('*, author:author_id(username, display_name, avatar_url), view_count, like_count')
            .eq('published', true)
            .order('view_count', { ascending: false });

        if (topic) {
            query = query.eq('topic', topic);
        }

        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            tutorials: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Tutorials error:', error);
        res.status(500).json({ error: 'Failed to fetch tutorials', details: error.message });
    }
});

/**
 * POST /api/education/tutorial
 * Create a tutorial
 */
router.post('/tutorial', async (req, res) => {
    try {
        const { authorId, title, content, topic, difficulty, tags, videoUrl } = req.body;

        if (!authorId || !title || !content) {
            return res.status(400).json({ error: 'authorId, title, and content required' });
        }

        const { data, error } = await supabase
            .from('tutorials')
            .insert({
                author_id: authorId,
                title,
                content,
                topic: topic || 'general',
                difficulty: difficulty || 'beginner',
                tags: tags || [],
                video_url: videoUrl,
                published: true,
                view_count: 0,
                like_count: 0
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            tutorial: data,
            message: 'Tutorial published successfully'
        });

    } catch (error) {
        console.error('Create tutorial error:', error);
        res.status(500).json({ error: 'Failed to create tutorial', details: error.message });
    }
});

/**
 * GET /api/education/mentors
 * Browse available mentors
 */
router.get('/mentors', async (req, res) => {
    try {
        const { specialty, minRating, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('mentors')
            .select('*, user:user_id(username, display_name, avatar_url, bio), session_count, rating_avg')
            .eq('accepting_students', true)
            .order('rating_avg', { ascending: false });

        if (specialty) {
            query = query.contains('specialties', [specialty]);
        }

        if (minRating) {
            query = query.gte('rating_avg', parseFloat(minRating));
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            mentors: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Mentors error:', error);
        res.status(500).json({ error: 'Failed to fetch mentors', details: error.message });
    }
});

/**
 * POST /api/education/mentorship/request
 * Request mentorship session
 */
router.post('/mentorship/request', async (req, res) => {
    try {
        const { mentorId, studentId, topic, preferredTime, message } = req.body;

        if (!mentorId || !studentId || !topic) {
            return res.status(400).json({ error: 'mentorId, studentId, and topic required' });
        }

        // Get mentor details
        const { data: mentor, error: mentorError } = await supabase
            .from('mentors')
            .select('hourly_rate, accepting_students')
            .eq('user_id', mentorId)
            .single();

        if (mentorError || !mentor.accepting_students) {
            return res.status(400).json({ error: 'Mentor not accepting students' });
        }

        const { data, error } = await supabase
            .from('mentorship_requests')
            .insert({
                mentor_id: mentorId,
                student_id: studentId,
                topic,
                preferred_time: preferredTime,
                message,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            request: data,
            hourlyRate: mentor.hourly_rate / 100,
            message: 'Mentorship request sent. Await mentor approval'
        });

    } catch (error) {
        console.error('Mentorship request error:', error);
        res.status(500).json({ error: 'Failed to request mentorship', details: error.message });
    }
});

/**
 * GET /api/education/certifications
 * Get available certifications
 */
router.get('/certifications', async (req, res) => {
    try {
        const { category } = req.query;

        let query = supabase
            .from('certifications')
            .select('*, issued_count')
            .eq('active', true)
            .order('issued_count', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            certifications: data
        });

    } catch (error) {
        console.error('Certifications error:', error);
        res.status(500).json({ error: 'Failed to fetch certifications', details: error.message });
    }
});

/**
 * POST /api/education/certification/earn
 * Earn a certification after completing requirements
 */
router.post('/certification/earn', async (req, res) => {
    try {
        const { userId, certificationId } = req.body;

        if (!userId || !certificationId) {
            return res.status(400).json({ error: 'userId and certificationId required' });
        }

        // Check if already earned
        const { data: existing } = await supabase
            .from('user_certifications')
            .select('id')
            .eq('user_id', userId)
            .eq('certification_id', certificationId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already earned this certification' });
        }

        // Verify requirements met (simplified - in production check course completions, tests, etc.)
        const certificationNumber = `CERT-${Date.now()}-${userId.substring(0, 6).toUpperCase()}`;

        const { data, error } = await supabase
            .from('user_certifications')
            .insert({
                user_id: userId,
                certification_id: certificationId,
                certification_number: certificationNumber,
                earned_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Increment issued count
        await supabase.rpc('increment_certification_issued', { certification_id: certificationId });

        res.json({
            certification: data,
            certificationNumber,
            message: 'Certification earned!'
        });

    } catch (error) {
        console.error('Earn certification error:', error);
        res.status(500).json({ error: 'Failed to earn certification', details: error.message });
    }
});

module.exports = router;
