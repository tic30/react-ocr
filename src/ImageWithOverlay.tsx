import { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';

type FindSubArrayParams = {
    mainArray: string[];
    subArray: string[];
};

const findSubarray = ({ mainArray, subArray }: FindSubArrayParams): number => {
    // If either array is empty or the subArray is longer than the mainArray, it's impossible to find a match.
    if (!mainArray || !subArray || subArray.length > mainArray.length) {
        return -1;
    }

    // Iterate through the main array. We only need to check up to the point where a full subarray can still fit.
    for (let i = 0; i <= mainArray.length - subArray.length; i++) {
        let match = true;

        // Check if the elements in the subArray match the corresponding elements in the mainArray.
        for (let j = 0; j < subArray.length; j++) {
            // If any word doesn't match, set 'match' to false and break the inner loop.
            if (mainArray[i + j].toLowerCase() !== subArray[j].toLowerCase()) {
                match = false;
                break;
            }
        }

        // If the inner loop completed and 'match' is still true, we found the subarray.
        if (match) {
            return i; // Return the starting index of the match.
        }
    }

    return -1; // If the outer loop finishes without finding a match, return -1.
};

export default function ImageWithOverlay({
    image,
    data,
}: {
    image: string;
    data: Tesseract.RecognizeResult['data'];
}) {
    const [highlightInput, setHighlightInput] = useState('');
    const [highlightedWordsStartingIndex, setHighlightedWordsStartingIndex] = useState(-1);
    // flatten the data
    const flattenedData = useMemo(
        () =>
            data?.blocks?.flatMap((block) =>
                block.paragraphs.flatMap((paragraph) =>
                    paragraph.lines.flatMap((line) => line.words),
                ),
            ),
        [data],
    );

    const debouncedFindSubarray = useCallback(
        debounce((params: FindSubArrayParams) => {
            const startIndex = findSubarray(params);
            setHighlightedWordsStartingIndex(startIndex);
        }, 500),
        [],
    );

    const highlightedWords = highlightInput.split(' ').filter(Boolean);
    const highlightedWordsLength = highlightedWords.length;

    useEffect(() => {
        if (highlightedWords.length > 0) {
            debouncedFindSubarray({
                mainArray: flattenedData?.map((word) => word.text) ?? [],
                subArray: highlightedWords,
            });
        } else {
            setHighlightedWordsStartingIndex(-1);
        }
    }, [debouncedFindSubarray, flattenedData, highlightInput]);

    return (
        <div>
            <span>Search phrase:</span>
            <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
            />
            <div style={{ position: 'relative' }}>
                <img src={image} alt="image" />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                    }}
                >
                    {flattenedData?.map((word, wordIndex) => {
                        const highlighted =
                            highlightedWordsStartingIndex !== -1 &&
                            wordIndex >= highlightedWordsStartingIndex &&
                            wordIndex < highlightedWordsStartingIndex + highlightedWordsLength;
                        const height = word.bbox.y1 - word.bbox.y0;

                        return (
                            <span
                                key={`word-${wordIndex}`}
                                style={{
                                    position: 'absolute',
                                    top: word.bbox.y0,
                                    left: word.bbox.x0,
                                    width: word.bbox.x1 - word.bbox.x0,
                                    height,
                                    backgroundColor: highlighted
                                        ? 'rgba(255, 249, 104, 0.8)'
                                        : 'rgba(189, 189, 189, 0.8)',
                                    textAlign: 'start',
                                    fontSize: `${height}px`,
                                    lineHeight: `${height}px`,
                                }}
                            >
                                {word.text}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
