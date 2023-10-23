const listHelper = require('../utils/list_helper');

test('dummy returns one', () => {
    const blogs = [];
    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
});

describe('total likes', () => {
    const emptyBlobList = [];
    const oneBlogList = [
        {
            _id: '6536503b7620fa0d2cc5d82e',
            title: 'My first Blog!',
            author: 'Tero K.',
            url: 'https://coolblogs.dev/1',
            likes: 0,
            __v: 0,
        },
    ];
    const manyBlogsList = [
        {
            _id: '6536503b7620fa0d2cc5d82e',
            title: 'My first Blog!',
            author: 'Tero K.',
            url: 'https://coolblogs.dev/1',
            likes: 0,
            __v: 0,
        },
        {
            _id: '6536508d7620fa0d2cc5d831',
            title: 'My second Blog!',
            author: 'Tero K.',
            url: 'https://coolblogs.dev/2',
            likes: 4,
            __v: 0,
        },
        {
            _id: '65365557eec0b4d41e3864ab',
            title: 'My cool Blog',
            author: 'Tero K.',
            url: 'https://coolblogs.dev/3',
            likes: 21,
            __v: 0,
        },
        {
            _id: '6536577b6ae3ad55f179ff19',
            title: 'My melancholy Blog',
            author: 'Tero K.',
            url: 'https://coolblogs.dev/4',
            likes: 18,
            __v: 0,
        },
        {
            _id: '6536580fbb2b5c14f138e386',
            title: 'My FSO Blog',
            author: 'Tero K.',
            url: 'https://coolblogs.dev/5',
            likes: 26,
            __v: 0,
        },
    ];

    test('should return 0 with an empty blog list', () => {
        expect(listHelper.totalLikes(emptyBlobList)).toBe(0);
    });

    test('should equal to the likes of the single blog in list', () => {
        expect(listHelper.totalLikes(oneBlogList)).toBe(0);
    });

    test('should sum likes correctly in list of many blogs', () => {
        expect(listHelper.totalLikes(manyBlogsList)).toBe(69);
    });
});
