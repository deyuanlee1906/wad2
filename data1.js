var threads = [
  {
    id: 1,
    title: "Thread 1",
    author: "Aaron",
    date: Date.now(),
    content: "First Post Caption.",
    comments: [
      { author: "Jack", date: Date.now(), content: "Hey there" },
      { author: "Arthur", date: Date.now(), content: "Hey to you too" }
    ]
  },
  {
    id: 2,
    title: "Thread 2",
    author: "Aaron",
    date: Date.now(),
    content: "Second Post Caption.",
    comments: [
      { author: "Jack", date: Date.now(), content: "Hey there" }
    ]
  }
];

if (localStorage.getItem('threads')) {
  threads = JSON.parse(localStorage.getItem('threads'));
} else {
  localStorage.setItem('threads', JSON.stringify(threads));
}
