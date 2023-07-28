import { link, Link, db } from './drizzle';

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

const targetKeys = ['created_at', 'title', 'url'];

function isValidEntry(entry) {
  if (targetKeys.some((key) => !(key in entry) || (entry[key] == null))) {
    return false;
  }
  if (entry.title.length > 100) {
    return false;
  }
  return true;
}

async function getData(topic): Promise<Partial<Link[]>> {
  const data = await fetch(`http://hn.algolia.com/api/v1/search?query=${topic}&tags=story`)
    .then((response) => response.json())
    .catch(console.error);

  const hits: Root[] = data.hits;

  if (!hits) {
    console.error('hits not ok', { hits });
    return;
  }

  let validEntries = new Array();

  for (let entry of hits) {
    if (isValidEntry(entry)) {
      validEntries.push({
        userId: '3a6f53ea-61de-4140-9503-b8aa89aa4388',
        createdAt: new Date(entry[targetKeys[0]]),
        description: entry[targetKeys[1]] as string,
        url: entry[targetKeys[2]] as string,
        topic,
      });
    } else {
      console.log('entry not valid', entry);
    }
  }

  return validEntries;
}

const topics = ['development', 'fun', 'funny', 'business', 'iot'];

(async function run() {
  const topicsEntries = await Promise.all(topics.map(getData));
  const allEntries = topicsEntries.flatMap((i) => i);

  console.log('trying to insert', allEntries);

  await db
    .insert(link)
    .values(allEntries)
    .execute()
    .then(() => {
      console.log(`💾 Seed completed succesfully with ${allEntries.length} entries`);
    })
    .catch((error) => {
      console.error('Seed did not work', error);
    });
})();
