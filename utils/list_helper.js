const dummy = (blogs) => 1;

const totalLikes = (blogs) => blogs.reduce((sum, item) => sum + item.likes, 0);

const favoriteBlog = (blogs) =>
    blogs.reduce((fav, item) => {
        return item.likes <= (fav.likes ?? -1)
            ? fav
            : {
                  title: item.title,
                  author: item.author,
                  likes: item.likes,
              };
    }, {});

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
};
