const getTokenFrom = (req) => {
    const auth = req.get('authorization');
    if (auth && auth.startsWith('Bearer ')) {
        return auth.replace('Bearer ', '');
    }
    return null;
};

module.exports = getTokenFrom;
