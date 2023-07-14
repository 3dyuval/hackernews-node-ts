import { PrismaClient } from '@prisma/client';
import { Link } from '@prisma/client';

const prisma = new PrismaClient();
export interface Root {
  created_at: string;
  title: string;
  url: string;
  author: string;
  points: number;
  story_text: string;
  comment_text: any;
  num_comments: number;
  story_id: any;
  story_title: any;
  story_url: any;
  parent_id: any;
  created_at_i: number;
  relevancy_score: number;
  _tags: string[];
  objectID: string;
  _highlightResult: HighlightResult;
}

export interface HighlightResult {
  title: Title;
  url: Url;
  author: Author;
  story_text: StoryText;
}

export interface Title {
  value: string;
  matchLevel: string;
  fullyHighlighted: boolean;
  matchedWords: string[];
}

export interface Url {
  value: string;
  matchLevel: string;
  fullyHighlighted: boolean;
  matchedWords: string[];
}

export interface Author {
  value: string;
  matchLevel: string;
  matchedWords: any[];
}

export interface StoryText {
  value: string;
  matchLevel: string;
  matchedWords: any[];
}

const keys = ['created_at', 'title', 'url'];

const add = (query, entry) =>
  prisma.link.create({
    data: {
      userId: '3a6f53ea-61de-4140-9503-b8aa89aa4388',
      createdAt: entry[keys[0]],
      description: entry[keys[1]],
      url: entry[keys[2]],
      topic: query,
    },
  });

async function getData(query) {
  const data = await fetch(`http://hn.algolia.com/api/v1/search?query=${query}&tags=story`)
    .then((response) => response.json())
    .catch(console.error);

  const hits: Root[] = data.hits;

  if (!hits) {
    console.error('hits not ok', { hits });
    return;
  }
  let result = new Array();
  for (let entry of hits) {
    if (keys.every((item) => item in entry && !!entry[item])) {
      const response = await add(query, entry);
      result.push(response);
    } else {
      console.warn('not ok', { entry });
    }
  }

  console.log('ok', { result });
}

const stuff = ['development', 'fun', 'funny', 'business', 'iot'];


(async function run() {
  await Promise.all(stuff.map(getData));
})()
