const Institute = require('../models/institute');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const institutes = await Institute.find({}).populate('popupText');
    res.render('institutes/index', { institutes })
}

module.exports.renderNewForm = (req, res) => {
    res.render('institutes/new');
}

module.exports.createInstitute = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.institute.location,
        limit: 1
    }).send()
    const institute = new Institute(req.body.institute);
    institute.geometry = geoData.body.features[0].geometry;
    institute.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    institute.author = req.user._id;
    await institute.save();
    console.log(institute);
    req.flash('success', 'Successfully added a new institute!');
    res.redirect(`/institutes/${institute._id}`)
}

module.exports.showInstitute = async (req, res,) => {
    const institute = await Institute.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!institute) {
        req.flash('error', 'Cannot find that institute!');
        return res.redirect('/institutes');
    }
    res.render('institutes/show', { institute });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const institute = await Institute.findById(id)
    if (!institute) {
        req.flash('error', 'Cannot find that institute!');
        return res.redirect('/institutes');
    }
    res.render('institutes/edit', { institute });
}

module.exports.updateInstitute = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const institute = await Institute.findByIdAndUpdate(id, { ...req.body.institute });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    institute.images.push(...imgs);
    await institute.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await institute.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated institute!');
    res.redirect(`/institutes/${institute._id}`)
}

module.exports.deleteInstitute = async (req, res) => {
    const { id } = req.params;
    await Institute.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted institute')
    res.redirect('/institutes');
}
