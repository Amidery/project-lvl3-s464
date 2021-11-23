export default (data) => {
  const domparser = new DOMParser();
  const dom = domparser.parseFromString(data.contents, 'text/xml');
  const parsererror = dom.getElementsByTagName('parsererror');
  if (parsererror.length !== 0) {
    throw new Error(parsererror.textContent);
  }

  const feedTitle = dom.querySelector('channel > title').textContent;
  const feedDescription = dom.querySelector('channel > description').textContent;
  const parsedFeed = { feedTitle, feedDescription };

  const items = [...dom.getElementsByTagName('item')].map((post) => {
    const title = post.querySelector('title').textContent;
    const link = post.querySelector('link').textContent;
    const description = post.querySelector('description').textContent;

    return {
      title,
      link,
      description,
    };
  });

  return { parsedFeed, items };
};
