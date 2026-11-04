import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chapters, chapterById } from '../src/content/chapters.ts';
import { curriculum } from '../src/data/curriculum.ts';

test('all published chapters have distinct routes and each learning mode has navigable content', () => {
  assert.equal(new Set(chapters.map(chapter => chapter.id)).size, chapters.length, 'chapter routes must be unique');
  for (const id of ['backprop', 'convolution', 'attention', 'ctc']) assert.ok(chapterById[id], 'existing deep links remain available');
  for (const chapter of chapters) {
    assert.equal(chapterById[chapter.id], chapter);
    assert.ok(curriculum.some(module => module.id === chapter.module));
    for (const [mode, sections] of Object.entries(chapter.sections)) {
      assert.ok(sections.length > 0, `${chapter.id}/${mode} is empty`);
      assert.equal(new Set(sections.map(section => section.id)).size, sections.length, `${chapter.id}/${mode} contains duplicate anchor IDs`);
      for (const section of sections) {
        assert.match(section.id, /^[a-z][a-z0-9-]*$/);
        assert.ok(section.title.trim());
        assert.ok(section.paragraphs.some(paragraph => paragraph.trim()), `${chapter.id}/${section.id} has no explanation`);
        if (section.formula) {
          assert.doesNotMatch(section.formula, /[\u0000-\u0008\u000b-\u001f]/, 'formula contains an accidental escape control character');
          assert.ok(section.notation?.length, `${chapter.id}/${section.id}: formula needs nearby definitions`);
          assert.ok(section.formulaReading?.trim(), `${chapter.id}/${section.id}: formula needs a plain-language reading`);
        }
        for (const notation of section.notation || []) {
          assert.ok(notation.symbol.trim() && notation.meaning.trim());
          assert.doesNotMatch(notation.symbol, /[\u0000-\u0008\u000b-\u001f]/, 'symbol contains an accidental escape');
        }
      }
    }
    assert.ok(chapter.sections.implementation.some(section => section.code), `${chapter.id} needs an implementation example`);
    assert.ok(chapter.misconceptions.length > 0);
    const sections = Object.values(chapter.sections).flat();
    assert.ok(sections.some(section => section.flow?.length), `${chapter.id} needs a visual computation sequence`);
    assert.ok(sections.some(section => section.checkpoint), `${chapter.id} needs a small self-check`);
    for (const reference of chapter.references) {
      assert.equal(new URL(reference.url).protocol, 'https:');
      assert.ok(reference.author && reference.title && reference.reason);
    }
  }
});

test('curriculum topics have stable unique routes, and ready entries point to real chapters', () => {
  assert.deepEqual(curriculum.map(module => module.id), [0, 1, 2, 3, 4, 5, 6, 7]);
  const topics = curriculum.flatMap(module => module.topics);
  assert.equal(new Set(topics.map(topic => topic.id)).size, topics.length);
  const chapterIds = new Set<string>(chapters.map(chapter => chapter.id));
  assert.equal(topics.filter(topic => topic.status !== 'ready').length, 0, 'every curriculum topic should now have authored content');
  for (const topic of topics) {
    assert.match(topic.id, /^[a-z][a-z0-9-]*$/);
    if (topic.status === 'ready') {
      assert.ok(topic.chapterId && chapterIds.has(topic.chapterId), `${topic.id} has a broken chapter target`);
    } else {
      assert.equal(topic.chapterId, undefined, `${topic.id} presents unfinished content as a chapter`);
    }
  }
  for (const chapter of chapters) assert.ok(topics.some(topic => topic.chapterId === chapter.id));
});

test('model encyclopedia includes grouped architectures and clearly identifies RAG as a system', () => {
  const models = curriculum.find(module => module.id === 4)!.topics;
  const englishIndex = models.map(topic => topic.english).join(' | ');
  for (const model of ['MLP', 'CNN', 'RNN', 'LSTM', 'GRU', 'Transformer', 'ResNet', 'U-Net', 'BERT', 'GPT', 'T5', 'ViT', 'CLIP', 'Autoencoder', 'VAE', 'GAN', 'Normalizing Flow', 'Diffusion', 'Latent Diffusion', 'DiT', 'Flow Matching', 'MoE', 'SSM', 'S4', 'Mamba', 'RAG', 'Multimodal']) {
    assert.ok(englishIndex.includes(model), `model index missing ${model}`);
  }
  assert.ok(models.find(topic => topic.id === 'system-rag')?.title.includes('系统'));
});

test('knowledge graph topic destinations resolve even when a curriculum entry groups multiple models', () => {
  // Inspect only declarative topic IDs; this does not require a DOM or importing React JSX.
  const source = readFileSync(new URL('../src/components/KnowledgeGraph.tsx', import.meta.url), 'utf8');
  const destinations = Array.from(source.matchAll(/topicId:'([^']+)'/g), match => match[1]);
  assert.ok(destinations.length > 0);
  const topicIds = new Set(curriculum.flatMap(module => module.topics.map(topic => topic.id)));
  for (const destination of destinations) assert.ok(topicIds.has(destination), `unknown graph target: ${destination}`);
});
