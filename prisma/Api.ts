export interface Root {
    created_at: string
    title: string
    url: string
    author: string
    points: number
    story_text: string
    comment_text: any
    num_comments: number
    story_id: any
    story_title: any
    story_url: any
    parent_id: any
    created_at_i: number
    relevancy_score: number
    _tags: string[]
    objectID: string
    _highlightResult: HighlightResult
  }
  
  export interface HighlightResult {
    title: Title
    url: Url
    author: Author
    story_text: StoryText
  }
  
  export interface Title {
    value: string
    matchLevel: string
    fullyHighlighted: boolean
    matchedWords: string[]
  }
  
  export interface Url {
    value: string
    matchLevel: string
    fullyHighlighted: boolean
    matchedWords: string[]
  }
  
  export interface Author {
    value: string
    matchLevel: string
    matchedWords: any[]
  }
  
  export interface StoryText {
    value: string
    matchLevel: string
    matchedWords: any[]
  }
  