const fs = require('fs')

const FILE_PATH = 'cwiczenia-20.02.2022/test/testowaTabDec.txt'
const END_OF_LINE_SYMBOL = '\n'

const entropy = (list) => {
    const logArray = list.map(el => el * Math.log2(el))
    return logArray.reduce((a,b) => a+b, 0) * -1
}

fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    const splitedArray = data.split(END_OF_LINE_SYMBOL).map(el => el.split(',')).filter(arr => arr.length === 5)
    const decisionArray = splitedArray.map(arr => arr[arr.length - 1])
    // Liczba wystapień poszczególnych elementów decyzyjnych - tablica jednowymiarowa
    const decisionElementsCount = Array.from(new Set(decisionArray)).map(uniqueElement => decisionArray.filter(el => el === uniqueElement).length)
    const decisionElemenntsSum = decisionElementsCount.reduce((a, b) => a + b, 0)
    const decisionElementsProbability = decisionElementsCount.map(el => el / decisionElemenntsSum)

    const ent = entropy(decisionElementsProbability)
    console.log('Entropia: ', ent)
})

