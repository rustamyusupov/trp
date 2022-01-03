const messageElement = 'message';

export default (content) =>
  (document.getElementById(messageElement).innerHTML = content);
