import React, { useState } from 'react';
import './NFTMinter.css';

/**
 * NFT Minter - Part of $1000 Super Admin Powers tier
 * 
 * Platform takes 50% of all NFT sales because "y'all are both idiots"
 * This is a dismissive addon tossed in with experimental admin toys
 */

export const NFTMinter = ({ userId, hasSuperAdminPowers }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [price, setPrice] = useState('');
  const [minting, setMinting] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [showMarketplace, setShowMarketplace] = useState(false);

  // Simulated minted NFTs for demo
  const [allNFTs] = useState([
    {
      id: 1,
      name: 'Waifu #001',
      creator: 'user123',
      price: 0.05,
      image: 'https://via.placeholder.com/300x300/FF69B4/000000?text=Waifu+001',
      listed: true
    },
    {
      id: 2,
      name: 'Anime Scene #042',
      creator: 'creator456',
      price: 0.1,
      image: 'https://via.placeholder.com/300x300/9370DB/000000?text=Scene+042',
      listed: true
    }
  ]);

  if (!hasSuperAdminPowers) {
    return (
      <div className="nft-minter-locked">
        <div className="lock-message">
          <h2>🤡 NFT Minter (Locked)</h2>
          <p>This stupid feature requires the <strong>$1000 Super Admin Powers</strong> tier.</p>
          <p>If you're into NFTs, unlock it. We'll take 50% of your sales because y'all are both idiots.</p>
          <button className="upgrade-button" onClick={() => window.location.href = '/?premium=true'}>
            Unlock $1000 Tier (If You Must)
          </button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMintNFT = async () => {
    if (!selectedFile || !nftName || !price) {
      alert('Please fill in all fields and select an image');
      return;
    }

    setMinting(true);

    // Simulate blockchain minting delay
    setTimeout(() => {
      const newNFT = {
        id: Date.now(),
        name: nftName,
        description: nftDescription,
        price: parseFloat(price),
        image: preview,
        creator: userId,
        listed: false,
        mintedAt: new Date().toISOString(),
        blockchain: 'Ethereum',
        tokenId: `0x${Math.random().toString(16).substr(2, 8)}`,
        platformCut: '50%'
      };

      setMintedNFTs([newNFT, ...mintedNFTs]);
      setMinting(false);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setNftName('');
      setNftDescription('');
      setPrice('');

      alert(`🎉 NFT Minted! Token ID: ${newNFT.tokenId}\n\n⚠️ Remember: We take 50% of any sales. No exceptions.`);
    }, 2000);
  };

  const listNFTForSale = (nftId) => {
    setMintedNFTs(mintedNFTs.map(nft => 
      nft.id === nftId ? { ...nft, listed: true } : nft
    ));
    alert('NFT listed on marketplace! Platform gets 50% of the sale price.');
  };

  const unlistNFT = (nftId) => {
    setMintedNFTs(mintedNFTs.map(nft => 
      nft.id === nftId ? { ...nft, listed: false } : nft
    ));
  };

  return (
    <div className="nft-minter-container">
      {/* Header with dismissive tone */}
      <div className="nft-header">
        <h1>🤡 NFT Minter</h1>
        <p className="disclaimer">
          You unlocked this stupid feature. We don't want anything to do with NFTs, 
          but if some idiot wants to buy one, we're taking <strong>50% of the sale</strong>. 
          No negotiations.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="nft-tabs">
        <button 
          className={!showMarketplace ? 'tab-active' : ''} 
          onClick={() => setShowMarketplace(false)}
        >
          Mint NFT
        </button>
        <button 
          className={showMarketplace ? 'tab-active' : ''} 
          onClick={() => setShowMarketplace(true)}
        >
          Marketplace
        </button>
      </div>

      {!showMarketplace ? (
        <div className="minting-section">
          {/* Upload Section */}
          <div className="upload-card">
            <h2>Upload Your "Masterpiece"</h2>
            <div className="upload-area" onClick={() => document.getElementById('nft-file-input').click()}>
              {preview ? (
                <img src={preview} alt="Preview" className="nft-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📁</span>
                  <p>Click to upload image</p>
                  <small>PNG, JPG, GIF up to 10MB</small>
                </div>
              )}
              <input 
                id="nft-file-input"
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* NFT Details Form */}
          <div className="details-card">
            <h2>NFT Details</h2>
            <div className="form-group">
              <label>NFT Name</label>
              <input 
                type="text" 
                placeholder="e.g., Waifu #001"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea 
                placeholder="Describe your NFT (if you must)"
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Price (ETH)</label>
              <input 
                type="number" 
                step="0.001"
                placeholder="e.g., 0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <small className="platform-cut-notice">
                ⚠️ Platform takes 50% (you get {price ? (parseFloat(price) * 0.5).toFixed(3) : '0.000'} ETH if sold)
              </small>
            </div>

            <button 
              className="mint-button"
              onClick={handleMintNFT}
              disabled={minting || !selectedFile || !nftName || !price}
            >
              {minting ? '⏳ Minting to Blockchain...' : '🎨 Mint NFT (Reluctantly)'}
            </button>
          </div>

          {/* Your Minted NFTs */}
          {mintedNFTs.length > 0 && (
            <div className="minted-nfts-section">
              <h2>Your Minted NFTs</h2>
              <div className="nft-grid">
                {mintedNFTs.map(nft => (
                  <div key={nft.id} className="nft-card">
                    <img src={nft.image} alt={nft.name} />
                    <div className="nft-info">
                      <h3>{nft.name}</h3>
                      <p className="nft-price">{nft.price} ETH</p>
                      <p className="token-id">Token: {nft.tokenId}</p>
                      <p className="platform-cut">Platform Cut: 50%</p>
                      {nft.listed ? (
                        <button className="unlist-button" onClick={() => unlistNFT(nft.id)}>
                          Remove from Marketplace
                        </button>
                      ) : (
                        <button className="list-button" onClick={() => listNFTForSale(nft.id)}>
                          List for Sale
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="marketplace-section">
          <h2>NFT Marketplace (Where Idiots Buy)</h2>
          <p className="marketplace-disclaimer">
            Every sale generates 50% for the platform, 50% for the creator. 
            If you're buying NFTs here, you're an idiot. If you're selling, at least you're getting paid.
          </p>

          <div className="nft-grid">
            {allNFTs.filter(nft => nft.listed).map(nft => (
              <div key={nft.id} className="nft-card marketplace-item">
                <img src={nft.image} alt={nft.name} />
                <div className="nft-info">
                  <h3>{nft.name}</h3>
                  <p className="nft-creator">by {nft.creator}</p>
                  <p className="nft-price">{nft.price} ETH</p>
                  <button className="buy-button">
                    Buy (If You Must)
                  </button>
                </div>
              </div>
            ))}

            {mintedNFTs.filter(nft => nft.listed).map(nft => (
              <div key={nft.id} className="nft-card marketplace-item your-listing">
                <div className="your-listing-badge">Your Listing</div>
                <img src={nft.image} alt={nft.name} />
                <div className="nft-info">
                  <h3>{nft.name}</h3>
                  <p className="nft-price">{nft.price} ETH</p>
                  <p className="earnings-estimate">You earn: {(nft.price * 0.5).toFixed(3)} ETH (50%)</p>
                  <button className="unlist-button" onClick={() => unlistNFT(nft.id)}>
                    Remove Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Banner */}
      <div className="nft-education-banner">
        <h3>💡 Why This Exists (And Why We Hate It)</h3>
        <p>
          NFTs are stupid. We've made that clear. But if people want to mint and trade them, 
          we'll facilitate it and take our 50% cut. Consider this an idiot tax.
        </p>
        <p>
          <strong>Blockchain:</strong> Ethereum (because that's what idiots use)<br/>
          <strong>Gas Fees:</strong> Your problem, not ours<br/>
          <strong>Platform Cut:</strong> 50% of every sale, auto-deducted<br/>
          <strong>Refunds:</strong> LOL no
        </p>
      </div>
    </div>
  );
};

export default NFTMinter;
