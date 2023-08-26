const Institute = require('../models/institute');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const institute = await Institute.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    institute.reviews.push(review);
    await review.save();
    await institute.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/institutes/${institute._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Institute.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/institutes/${id}`);
}
