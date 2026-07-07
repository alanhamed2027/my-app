const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get system settings (Org name, logo)
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res, next) => {
  try {
    // We only have one setting record, ID is "global"
    let setting = await prisma.setting.findUnique({
      where: { id: 'global' }
    });

    // If it doesn't exist, create default
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          id: 'global',
          orgName: 'ناوی فەرمانگە'
        }
      });
    }

    return sendSuccess(res, 200, 'Settings retrieved', setting);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/settings
 * @access  Private (Admin only)
 */
const updateSettings = async (req, res, next) => {
  try {
    const { orgName, orgLogo } = req.body;
    let finalLogoUrl = orgLogo;

    // Check if orgLogo is a base64 string
    if (orgLogo && orgLogo.startsWith('data:image')) {
      const matches = orgLogo.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        let type = matches[1];
        if (type === 'jpeg') type = 'jpg';
        const data = Buffer.from(matches[2], 'base64');
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const fileName = `logo_${Date.now()}.${type}`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, data);
        
        // Construct the full URL for the image
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        finalLogoUrl = `${baseUrl}/uploads/${fileName}`;
      }
    }

    const setting = await prisma.setting.upsert({
      where: { id: 'global' },
      update: {
        orgName,
        ...(finalLogoUrl !== undefined && { orgLogo: finalLogoUrl }) // Only update logo if provided
      },
      create: {
        id: 'global',
        orgName: orgName || 'ناوی فەرمانگە',
        orgLogo: finalLogoUrl
      }
    });

    return sendSuccess(res, 200, 'Settings updated successfully', setting);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
