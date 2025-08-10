export default function ImageWithOverlay({
    image,
    data,
}: {
    image: string;
    data: Tesseract.RecognizeResult['data'];
}) {
    // flatten the data
    const flattenedData = data?.blocks?.flatMap((block) =>
        block.paragraphs.flatMap((paragraph) => paragraph.lines.flatMap((line) => line.words)),
    );

    return (
        <div style={{ position: 'relative' }}>
            <img src={image} alt="image" />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 10,
                }}
            >
                {flattenedData?.map((word, wordIndex) => (
                    <span
                        key={`word-${wordIndex}`}
                        style={{
                            position: 'absolute',
                            top: word.bbox.y0,
                            left: word.bbox.x0,
                            width: word.bbox.x1 - word.bbox.x0,
                            height: word.bbox.y1 - word.bbox.y0,
                            backgroundColor: 'yellow',
                        }}
                    >
                        {word.text}
                    </span>
                ))}
            </div>
        </div>
    );
}
