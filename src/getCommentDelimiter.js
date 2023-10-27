const path = require('path');
// Given a file's extension, determine the appropriate comment delimiter.
function getCommentDelimiter(filename) {
    const ext = path.extname(filename);
    switch(ext) {
        case '.py':
            return '#';
        case '.js':
        case '.ts':
        case '.java':
        case '.c':
        case '.cs':
        case '.cpp':
        case '.m':
            return '//';
        case '.php':
            return '/*';
        case '.rb':
            return '#';
        case '.go':
            return '//';
        case '.rs':
            return '//';
        case '.swift':
            return '//';
        // add more cases as needed...
        default:
            return '//'; // Default to C-style comment, but this can be adjusted
    }
}

module.exports = getCommentDelimiter
