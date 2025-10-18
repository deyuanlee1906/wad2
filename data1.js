var threads = [
  // Newton Food Centre
  {
    id: "nfc-1",
    title: "Newton Review #1",
    author: "Marcus",
    date: Date.now(),
    content: "Stingray at Newton was smoky, tender and perfectly spicy. The sambal had a nice kick without overpowering the fish.",
    mediaUrl: "../img/newton.jpg",
    comments: [
      { author: "Claire", date: Date.now(), content: "Totally agree, the sambal is legit." },
      { author: "Dylan", date: Date.now(), content: "Which stall did you go to?" }
    ]
  },
  {
    id: "nfc-2",
    title: "Newton Review #2",
    author: "Claire",
    date: Date.now(),
    content: "BBQ chicken wings were crisp outside, juicy inside. Lime and chili dip made it addictive.",
    mediaUrl: "../img/newton.jpg",
    comments: [
      { author: "Marcus", date: Date.now(), content: "I always get extra lime!" }
    ]
  },
  {
    id: "nfc-3",
    title: "Newton Review #3",
    author: "Aaron",
    date: Date.now(),
    content: "Satay was fragrant with a good char. Peanut sauce was slightly sweet but super creamy.",
    mediaUrl: "../img/newton.jpg",
    comments: [
      { author: "Wen", date: Date.now(), content: "Beef or chicken satay?" },
      { author: "Aaron", date: Date.now(), content: "Chicken and mutton!" }
    ]
  },
  {
    id: "nfc-4",
    title: "Newton Review #4",
    author: "Ivy",
    date: Date.now(),
    content: "Sugarcane juice was fresh and not too sweet. Perfect after a spicy meal.",
    mediaUrl: "../img/newton.jpg",
    comments: [
      { author: "Zack", date: Date.now(), content: "Always get it with lemon for extra zing." }
    ]
  },

  // Changi Village Food Centre
  {
    id: "cvfc-1",
    title: "Changi Village Review #1",
    author: "Wen",
    date: Date.now(),
    content: "Nasi lemak had fragrant rice and crispy chicken wing. Sambal leaned sweet with a gentle heat.",
    mediaUrl: "../img/changi_village.jpg",
    comments: [
      { author: "Ivy", date: Date.now(), content: "The egg there is always perfectly runny." },
      { author: "Marcus", date: Date.now(), content: "Which stall queue was shorter?" }
    ]
  },
  {
    id: "cvfc-2",
    title: "Changi Village Review #2",
    author: "Zack",
    date: Date.now(),
    content: "Chicken chop hor fun was smoky with silky gravy. The char on the chicken was excellent.",
    mediaUrl: "../img/changi_village.jpg",
    comments: [
      { author: "Claire", date: Date.now(), content: "Never tried this there, adding to my list!" }
    ]
  },
  {
    id: "cvfc-3",
    title: "Changi Village Review #3",
    author: "Dylan",
    date: Date.now(),
    content: "Goreng pisang had a thin, crisp batter and soft banana inside. Not oily at all.",
    mediaUrl: "../img/changi_village.jpg",
    comments: [
      { author: "Aaron", date: Date.now(), content: "Great snack before cycling back." }
    ]
  },
  {
    id: "cvfc-4",
    title: "Changi Village Review #4",
    author: "Marcus",
    date: Date.now(),
    content: "Mee rebus gravy was thick and slightly sweet, with a nice kick from the chili. Portion was generous.",
    mediaUrl: "../img/changi_village.jpg",
    comments: [
      { author: "Wen", date: Date.now(), content: "I like squeezing extra lime into it." }
    ]
  },

  // Maxwell Food Centre
  {
    id: "mfc-1",
    title: "Maxwell Review #1",
    author: "Ivy",
    date: Date.now(),
    content: "Chicken rice was fragrant with tender meat. Chili had a sharp heat and the broth was comforting.",
    mediaUrl: "../img/maxwell.jpg",
    comments: [
      { author: "Zack", date: Date.now(), content: "Queue was long? Worth it?" },
      { author: "Ivy", date: Date.now(), content: "About 15 mins, definitely worth it." }
    ]
  },
  {
    id: "mfc-2",
    title: "Maxwell Review #2",
    author: "Claire",
    date: Date.now(),
    content: "Fish soup was clean and light with fresh slices. Loved the fried garlic bits on top.",
    mediaUrl: "../img/maxwell.jpg",
    comments: [
      { author: "Dylan", date: Date.now(), content: "Clear or milky broth?" },
      { author: "Claire", date: Date.now(), content: "Clear!" }
    ]
  },
  {
    id: "mfc-3",
    title: "Maxwell Review #3",
    author: "Marcus",
    date: Date.now(),
    content: "Fried oyster had crispy edges with gooey center. Chili balanced the richness nicely.",
    mediaUrl: "../img/maxwell.jpg",
    comments: [
      { author: "Wen", date: Date.now(), content: "Portion size good for 2 to share." }
    ]
  },
  {
    id: "mfc-4",
    title: "Maxwell Review #4",
    author: "Aaron",
    date: Date.now(),
    content: "Carrot cake (black) was well caramelized and not too sweet. Plenty of egg and chye poh.",
    mediaUrl: "../img/maxwell.jpg",
    comments: [
      { author: "Claire", date: Date.now(), content: "Team black or white?" },
      { author: "Aaron", date: Date.now(), content: "Always black." }
    ]
  },

  // Mixed extras
  {
    id: "mix-1",
    title: "Newton Soursop Drink",
    author: "Zack",
    date: Date.now(),
    content: "Tried soursop juice at Newton—tart, refreshing, and great after BBQ.",
    mediaUrl: "../img/newton.jpg",
    comments: [
      { author: "Ivy", date: Date.now(), content: "I prefer lime juice, but soursop is good too!" }
    ]
  },
  {
    id: "mix-2",
    title: "Changi Kaya Toast",
    author: "Claire",
    date: Date.now(),
    content: "Ended breakfast with kaya toast—crisp bread, thick butter. Kopi was strong!",
    mediaUrl: "../img/changi_village.jpg",
    comments: [
      { author: "Marcus", date: Date.now(), content: "Classic combo." }
    ]
  },
  {
    id: "mix-3",
    title: "Maxwell Tau Huey",
    author: "Wen",
    date: Date.now(),
    content: "Tau huey smooth like silk, syrup not cloying. Perfect light dessert.",
    mediaUrl: "../img/maxwell.jpg",
    comments: [
      { author: "Dylan", date: Date.now(), content: "Is the queue still crazy?" }
    ]
  }
];

// Persist this curated dataset each load so the feed is populated
localStorage.setItem('threads', JSON.stringify(threads));
