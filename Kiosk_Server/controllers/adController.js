// controllers/adController.js
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../db');

// ✅ Get ads for specific kiosk (global + kiosk-specific)
exports.getAdsForKiosk = async (req, res) => {
  try {
    const { kioskId } = req.params;
    const { include_metadata = 'false' } = req.query;
    
    if (!kioskId) {
      return res.status(400).json({ error: 'Kiosk ID is required' });
    }

    // Get global ads AND ads for this specific kiosk
    const [ads] = await db.execute(`
      SELECT 
        a.*,
        CASE 
          WHEN a.kiosk_id IS NULL THEN 'global'
          ELSE 'kiosk-specific'
        END as ad_type
      FROM ads a
      WHERE (a.kiosk_id IS NULL OR a.kiosk_id = ?)
      ORDER BY 
        a.kiosk_id DESC, -- Show kiosk-specific ads first
        a.created_at DESC
    `, [kioskId]);

    if (include_metadata === 'true') {
      // Add file metadata
      const adsWithMetadata = await Promise.all(
        ads.map(async (ad) => {
          const filePath = path.join(__dirname, '../uploads/', ad.filename);
          try {
            const stats = fs.statSync(filePath);
            const fileBuffer = fs.readFileSync(filePath);
            const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
            
            return {
              ...ad,
              file_hash: hash,
              file_size: stats.size,
              last_modified: stats.mtime.toISOString(),
              url: `${req.protocol}://${req.get('host')}/uploads/${ad.filename}`,
              download_url: `${req.protocol}://${req.get('host')}/api/ads/download/${ad.id}`
            };
          } catch (err) {
            console.error(`Error reading file ${ad.filename}:`, err);
            return { ...ad, file_hash: null };
          }
        })
      );
      
      // Filter out ads with missing files
      const validAds = adsWithMetadata.filter(ad => ad.file_hash !== null);
      
      res.json({
        success: true,
        kiosk_id: kioskId,
        ads: validAds,
        count: validAds.length,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        kiosk_id: kioskId,
        ads: ads,
        count: ads.length
      });
    }
  } catch (err) {
    console.error('Error fetching kiosk ads:', err);
    res.status(500).json({ error: 'Error fetching advertisements' });
  }
};

// ✅ Get ads for sync (background synchronization)
exports.getAdsForSync = async (req, res) => {
  try {
    const { kioskId } = req.params;
    const { last_sync } = req.query;
    
    if (!kioskId) {
      return res.status(400).json({ error: 'Kiosk ID is required' });
    }

    // Get ads for this kiosk
    const [ads] = await db.execute(`
      SELECT a.* FROM ads a
      WHERE (a.kiosk_id IS NULL OR a.kiosk_id = ?)
    `, [kioskId]);

    // Generate sync data
    const syncData = {
      kiosk_id: parseInt(kioskId),
      timestamp: new Date().toISOString(),
      ads: []
    };

    // Add file metadata and hash
    for (const ad of ads) {
      const filePath = path.join(__dirname, '../uploads/', ad.filename);
      try {
        const stats = fs.statSync(filePath);
        const fileBuffer = fs.readFileSync(filePath);
        const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
        
        // Check if ad was modified since last sync
        const shouldInclude = !last_sync || 
          new Date(stats.mtime) > new Date(last_sync) ||
          !ad.file_hash || 
          ad.file_hash !== hash;

        if (shouldInclude) {
          syncData.ads.push({
            id: ad.id,
            filename: ad.filename,
            type: ad.type,
            kiosk_id: ad.kiosk_id,
            file_hash: hash,
            file_size: stats.size,
            last_modified: stats.mtime.toISOString(),
            is_global: ad.kiosk_id === null
          });
        }
      } catch (err) {
        console.error(`Error processing ad ${ad.id}:`, err);
      }
    }

    res.json(syncData);
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
};

// ✅ Upload ad (global or kiosk-specific)
exports.uploadAd = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const { kiosk_id } = req.body;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Set file type
    const type = file.mimetype.startsWith('video') ? 'video' : 'image';
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${type}_${timestamp}_${randomString}${fileExtension}`;
    
    const uploadPath = path.join(__dirname, '../uploads/', uniqueFilename);

    // Move the file
    await file.mv(uploadPath);

    // Generate file hash
    const fileBuffer = fs.readFileSync(uploadPath);
    const file_hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const file_size = file.size;

    // Parse kiosk_id (null for global ads)
    const parsedKioskId = kiosk_id && kiosk_id !== '' ? parseInt(kiosk_id) : null;

    // Check if kiosk exists (if kiosk-specific ad)
    if (parsedKioskId) {
      const [kiosk] = await db.execute('SELECT id FROM kiosks WHERE id = ?', [parsedKioskId]);
      if (kiosk.length === 0) {
        fs.unlinkSync(uploadPath); // Clean up
        return res.status(404).json({ error: 'Kiosk not found' });
      }
    }

    // Insert into database
    const [result] = await db.execute(
      `INSERT INTO ads 
       (filename, type, kiosk_id, file_hash, file_size) 
       VALUES (?, ?, ?, ?, ?)`,
      [uniqueFilename, type, parsedKioskId, file_hash, file_size]
    );

    res.json({
      success: true,
      message: parsedKioskId ? 'Kiosk-specific ad uploaded' : 'Global ad uploaded',
      ad: {
        id: result.insertId,
        filename: uniqueFilename,
        type: type,
        kiosk_id: parsedKioskId,
        is_global: parsedKioskId === null,
        file_hash: file_hash,
        file_size: file_size,
        url: `${req.protocol}://${req.get('host')}/uploads/${uniqueFilename}`
      }
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Error uploading file' });
  }
};

// ✅ Download ad for caching
exports.downloadAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { kioskId } = req.query; // Verify kiosk has permission

    const [rows] = await db.execute(
      `SELECT filename, kiosk_id FROM ads WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const ad = rows[0];
    
    // Check if ad is accessible to this kiosk
    if (ad.kiosk_id && ad.kiosk_id !== parseInt(kioskId)) {
      return res.status(403).json({ error: 'Ad not accessible to this kiosk' });
    }

    const filePath = path.join(__dirname, '../uploads/', ad.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, ad.filename);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Error downloading ad' });
  }
};

// ✅ Get all ads for admin panel
exports.getAllAds = async (req, res) => {
  try {
    const { kiosk_id, type } = req.query;
    
    let query = `
      SELECT 
        a.*,
        k.name as kiosk_name,
        k.location,
        CASE 
          WHEN a.kiosk_id IS NULL THEN 'Global'
          ELSE 'Kiosk-specific'
        END as scope
      FROM ads a
      LEFT JOIN kiosks k ON a.kiosk_id = k.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (kiosk_id) {
      query += ' AND (a.kiosk_id = ? OR a.kiosk_id IS NULL)';
      params.push(kiosk_id);
    }
    
    if (type) {
      query += ' AND a.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY a.kiosk_id, a.created_at DESC';
    
    const [ads] = await db.execute(query, params);
    
    // Add URLs
    const adsWithUrls = ads.map(ad => ({
      ...ad,
      url: `${req.protocol}://${req.get('host')}/uploads/${ad.filename}`,
      thumbnail_url: ad.type === 'video' 
        ? `${req.protocol}://${req.get('host')}/api/ads/thumbnail/${ad.id}`
        : `${req.protocol}://${req.get('host')}/uploads/${ad.filename}`
    }));
    
    res.json({
      success: true,
      ads: adsWithUrls,
      count: adsWithUrls.length
    });
  } catch (err) {
    console.error('Error fetching ads:', err);
    res.status(500).json({ error: 'Error fetching ads' });
  }
};

// ✅ Delete ad
exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ad info before deleting
    const [ad] = await db.execute(
      'SELECT filename, kiosk_id FROM ads WHERE id = ?',
      [id]
    );
    
    if (ad.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    // Delete from database
    await db.execute('DELETE FROM ads WHERE id = ?', [id]);
    
    // Delete file
    const filePath = path.join(__dirname, '../uploads/', ad[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({
      success: true,
      message: 'Ad deleted successfully',
      deleted_id: id
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Error deleting ad' });
  }
};