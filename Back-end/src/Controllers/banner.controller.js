const Banner = require('../Models/banner.model');

// GET active banner (public)
const getActiveBanner = async (req, res) => {
  try {
    const now = new Date();
    // A banner is active if isActive = true AND 
    // current date is within the startDate - endDate range (if set)
    const banner = await Banner.findOne({
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    })
    .populate('linkedProducts')
    .sort({ createdAt: -1 });

    if (!banner) {
      return res.status(200).json({ 
        success: true, 
        banner: null 
      });
    }

    return res.status(200).json({ 
      success: true, 
      banner 
    });
  } catch (error) {
    console.error('Get banner error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch banner' 
    });
  }
};

// GET all banners (admin)
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate('linkedProducts')
      .sort({ createdAt: -1 });
    return res.status(200).json({ 
      success: true, 
      banners 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch banners' 
    });
  }
};

// POST create banner (admin)
const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    return res.status(201).json({ 
      success: true, 
      banner 
    });
  } catch (error) {
    console.error('Create banner error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create banner' 
    });
  }
};

// PUT update banner (admin)
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Banner not found' 
      });
    }
    return res.status(200).json({ 
      success: true, 
      banner 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update banner' 
    });
  }
};

// PATCH toggle active state (admin)
const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Banner not found' 
      });
    }
    banner.isActive = !banner.isActive;
    await banner.save();
    return res.status(200).json({ 
      success: true, 
      banner 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle banner' 
    });
  }
};

// DELETE banner (admin)
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
        return res.status(404).json({
           success: false,
           message: 'Banner not found'
        })
    }
    return res.status(200).json({ 
      success: true, 
      message: 'Banner deleted' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete banner' 
    });
  }
};

module.exports = {
  getActiveBanner,
  getAllBanners,
  createBanner,
  updateBanner,
  toggleBanner,
  deleteBanner
};
