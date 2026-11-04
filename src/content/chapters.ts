import type {Chapter} from './types.ts';
export type {Chapter,Section,LearningMode,Notation} from './types.ts';
import {coreChapters} from './coreChapters.ts';
import {annotateCoreChapter} from './coreNotation.ts';
import {foundationsChapters} from './foundationsChapters.ts';
import {visionSequenceChapters} from './visionSequenceChapters.ts';
import {generativeChapters} from './generativeChapters.ts';
import {llmChapters} from './llmChapters.ts';
import {speechPracticeChapters} from './speechPracticeChapters.ts';

export const chapters: Chapter[] = [...coreChapters.map(annotateCoreChapter),...foundationsChapters,...visionSequenceChapters,...generativeChapters,...llmChapters,...speechPracticeChapters];
export const chapterById = Object.fromEntries(chapters.map(chapter=>[chapter.id,chapter])) as Record<string,Chapter>;
export const chapterForTopic = Object.fromEntries(chapters.flatMap(chapter=>(chapter.topicIds||[chapter.id]).map(topicId=>[topicId,chapter.id]))) as Record<string,string>;
