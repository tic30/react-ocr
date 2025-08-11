# react-ocr

Use Tesseract to recognize words from an image, display words in place, and search a phrase to highlight.

![Sample screenshot](public/sample-result.png 'Sample screenshot')

### Dev

```
npm i
npm run dev
```

### How does it work

Step1: Create Tesseract worker and call `worker.recognize` when an image is uploaded. Set param `blocks: true`.

Step2: Get a flattened array of word objects by calling `data.blocks.flatMap`.

Step3: Get position of each word from its `bbox`. Then create a span for each word and set its CSS as the following:

```
position: 'absolute',
top: word.bbox.y0,
left: word.bbox.x0,
width: word.bbox.x1 - word.bbox.x0,
height: word.bbox.y1 - word.bbox.y0
```

You can adjust font size, line height etc. to make your words look better.

Step4: Do subarray search of the search term(string to array split by space) on the flattened array of word objects. You may find a more efficient way than my solution. Highlight the words found.
