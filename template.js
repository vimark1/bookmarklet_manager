
function GithubPRLink() {
  alert(document.title + '\n' + window.location.href);
}

function PivotalStoryName() {
  var storyname = $('.maximized .story.name').text().trim();
  var url = window.location.href;
  alert(storyname + ' - ' + url);
}

function main() {
  return [GithubPRLink, PivotalStoryName];
}

