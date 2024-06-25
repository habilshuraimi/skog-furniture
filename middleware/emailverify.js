export const verified = (req,res,next)=> req.session.verified === true ? next() : res.redirect('/email')
