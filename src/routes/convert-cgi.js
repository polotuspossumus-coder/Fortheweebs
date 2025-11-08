import { verify } from 'jsonwebtoken';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const formats = JSON.parse(formData.get('formats') || '{}');
    const userId = formData.get('userId');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/quicktime',
      'image/jpeg',
      'image/png',
      'model/obj',
      'application/octet-stream' // For .fbx, .blend, .glb
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|jpg|jpeg|png|obj|fbx|blend|glb|gltf)$/i)) {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: ${file.name}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const convertedFiles = [];

    // Original file (if requested)
    if (formats.original) {
      const originalFilename = `${userId}/original/${Date.now()}-${file.name}`;
      const originalBlob = await put(originalFilename, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      convertedFiles.push({
        format: 'original',
        filename: file.name,
        url: originalBlob.url,
        size: file.size
      });
    }

    // VR conversion (if requested)
    if (formats.vr) {
      const vrResult = await convertToVR(file, userId);
      convertedFiles.push(vrResult);
    }

    // AR conversion (if requested)
    if (formats.ar) {
      const arResult = await convertToAR(file, userId);
      convertedFiles.push(arResult);
    }

    return new Response(
      JSON.stringify({
        success: true,
        files: convertedFiles,
        message: 'Conversion complete'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('CGI conversion error:', error);
    return new Response(
      JSON.stringify({ error: 'Conversion failed', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function convertToVR(file, userId) {
  // TODO: Implement actual VR conversion
  // This would typically involve:
  // 1. For 3D models: Optimize mesh, reduce polygons, bake textures
  // 2. For videos: Convert to 360° format, add spatial audio
  // 3. For images: Convert to equirectangular projection for 360° viewing

  // Example with external conversion API:
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('format', 'vr');
  //
  //   const response = await fetch('https://conversion-api.com/convert', {
  //     method: 'POST',
  //     headers: { 'Authorization': `Bearer ${process.env.CONVERSION_API_KEY}` },
  //     body: formData
  //   });
  //   const data = await response.json();
  //   const vrBlob = await put(`${userId}/vr/${Date.now()}.glb`, data.file, {
  //     access: 'public',
  //     token: process.env.BLOB_READ_WRITE_TOKEN
  //   });

  // Placeholder: Just upload original as VR format
  const vrFilename = `${userId}/vr/${Date.now()}-vr.glb`;
  const vrBlob = await put(vrFilename, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return {
    format: 'vr',
    filename: `vr-${file.name}`,
    url: vrBlob.url,
    size: file.size,
    note: 'VR conversion placeholder - integrate 3D optimization library'
  };
}

async function convertToAR(file, userId) {
  // TODO: Implement actual AR conversion
  // This would typically involve:
  // 1. Convert to .usdz for iOS ARKit
  // 2. Optimize .glb for Android ARCore
  // 3. Add plane detection metadata
  // 4. Optimize for mobile performance

  // Example with Reality Converter or similar tool:
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('format', 'ar');
  //   formData.append('platform', 'ios'); // or 'android'
  //
  //   const response = await fetch('https://ar-conversion-api.com/convert', {
  //     method: 'POST',
  //     headers: { 'Authorization': `Bearer ${process.env.AR_CONVERSION_API_KEY}` },
  //     body: formData
  //   });
  //   const data = await response.json();

  // Placeholder: Upload original as AR format
  const arFilename = `${userId}/ar/${Date.now()}-ar.glb`;
  const arBlob = await put(arFilename, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return {
    format: 'ar',
    filename: `ar-${file.name}`,
    url: arBlob.url,
    size: file.size,
    note: 'AR conversion placeholder - integrate USDZ converter for iOS'
  };
}
