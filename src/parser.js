import _ from 'lodash';

export const parse = (xml) => {
  const domparser = new DOMParser();
  const dom = domparser.parseFromString(xml.data, 'text/xml');
  const feedTitle = dom.querySelector('channel > title').textContent;
  const feedDescription = dom.querySelector('channel > description').textContent;
  const parsedFeed = { feedTitle, feedDescription };

  const parsedPosts = [...dom.getElementsByTagName('item')].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postLink = post.querySelector('link').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postId = _.uniqueId();
    return { postTitle, postLink, postDescription, postId };
  });

  return { parsedFeed, parsedPosts };
};
