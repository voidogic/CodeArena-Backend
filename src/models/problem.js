const mongoose = require('mongoose')
const { Schema } = mongoose;

const problemSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,

    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: {
        type: String,
        // enum:['array', 'string', 'dp','graph','tree','string','linkedlist'],
        enum: [
            'array',
            'string',
            'linked_list',
            'stack',
            'queue',
            'hash_table',
            'tree',
            'binary_search_tree',
            'heap',
            'graph',
            'trie',
            'dynamic_programming',
            'backtracking',
            'greedy',
            'divide_and_conquer',
            'bit_manipulation',
            'two_pointers',
            'sliding_window',
            'sorting',
            'searching',
            'recursion',
            'math',
            'matrix',
            'union_find',
            'segment_tree',
            'binary_indexed_tree'
        ],
        required: true
    },
    visibleTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },
            explanation: {
                type: String,
                required: true,
            }

        }
    ],
    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },
        }
    ],
    startCode: [
        {
            language: {
                type: String,
                required: true,
            },
            initialCode: {
                type: String,
                required: true,
            }

        }
    ],
    referenceSolution: [
        {
            language: {
                type: String,
                required: true
            },
            completeCode: {
                type: String,
                required: true
            }
        }
    ],
    problemCreator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }
})

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;