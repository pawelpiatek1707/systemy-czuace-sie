const fs = require('fs')

const FILE_PATH = 'cwiczenia-20.02.2022/test/testowaTabDec.txt'
const END_OF_LINE_SYMBOL = '\n'

const returnElementsCount = (array) => {
    return Array.from(new Set(array)).map(uniqueElement => array.filter(el => el === uniqueElement).length)
}

const entropy = (probabilityArray) => {
    const logArray = probabilityArray.map(el => {
        if (el > 0) {
            return el * Math.log2(el)
        }
        return el
    })
    return logArray.reduce((a, b) => a + b, 0) * -1
}


fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    const splitedArray = data.split(END_OF_LINE_SYMBOL).map(el => el.split(',')).filter(arr => arr.length === 5)
    const decisionArray = splitedArray.map(arr => arr[arr.length - 1])
    const decisionElementsCount = returnElementsCount(decisionArray)
    const decisionElementsSum = decisionElementsCount.reduce((a, b) => a + b, 0)
    const decisionElementsProbability = decisionElementsCount.map(el => el / decisionElementsSum)

    const infoArrayForAllData = []
    const splitInfoArray = []

    for(let i = 0; i< splitedArray[0].length - 1; i++) {
        const aIndex = splitedArray.map(arr => arr[i])
        const aIndexValues = splitedArray.map(arr => arr[arr.length - 1])

        // Wartości z danej kolumny wraz z elementem decyzyjnym dla danego elementu
        /* Struktura
        ***************************************************
            [
                {element: el1KolumnaI, value: el1KolumnaDecyzyjna},
                {element: el2KolumnaI, value: el2KolumnaDecyzyjna},
                {element: elnKolumnaI, value: elnKolumnaDecyzyjna}
            ]
        ***************************************************
        */
        const colWithDecision = aIndex.map((element, index) => {
            return {
                element,
                value: aIndexValues[index]
            }
        })
        // Unikalne klucze występujące w danej kolumnie z określonej iteracji
        const uniqueElements = Array.from(new Set(colWithDecision.map(({ element }) => element)))

        // Unikalne klucze występujące w kolumnie decyzyjnej
        const uniqueDecisionElements = Array.from(new Set(colWithDecision.map(({ value }) => value)))

        // Unikalny element z danej kolumny wraz z liczbą wystąpień np. 0 -> 2
        // Potrzebne w późniejszych obiczeniach - jaką część wszystkich elementów stanowi dany element np. 3/9 albo 2/9
        const uniqueElementsWithNumberOfAppearences = uniqueElements.map(uniqueElement => {
            const numberOfApperances = aIndex.filter(el => el === uniqueElement).length
            return {
                element: uniqueElement,
                numberOfApperances
            }
        })

        // Unikalny element wraz z tablicą liczby wystąpień konkretnej wartości z kolumny decyzyjnej
        /*
        ***************************************************
            np. {uniqueElement: '0', innerArray: [1,2,0]}
            Oznacza to, że element '0' z danej kolumny:
            - 1 raz miał wartość decyzyjną = 0
            - 2 razy miał wartość decyzyjną = 1
            - 0 razy miał wartość decyzyjną = 2
        ***************************************************
        */
        const uniqueElementWithArrayOfUniqueDecisionElementsApperences = uniqueElements.map(uniqueElement => {
            const innerArray = uniqueDecisionElements.map(uniqueDecisionElement => {
                const apperences = colWithDecision.filter(({ element, value }) => {
                    if (element === uniqueElement && value === uniqueDecisionElement) {
                        return {
                            element,
                            value
                        }
                    }
                })
                return apperences.length
            })
            return {
                uniqueElement,
                innerArray
            }
        })


        // Tablica obiektów w formacie: {element, liczba_wystąpień/całość, tablica_prawdopodobieństwa}
        const mergedData = uniqueElementsWithNumberOfAppearences.map((elementWithApperance, index) => {
            return {
                element: elementWithApperance.element,
                portion: elementWithApperance.numberOfApperances/colWithDecision.length,
                probabilitArray: uniqueElementWithArrayOfUniqueDecisionElementsApperences[index].innerArray.map(el => el/elementWithApperance.numberOfApperances)
            }
        })

        const infoValuesArray = mergedData.map(mergedDataElement => {
            const mergedDataElementEntropy = entropy(mergedDataElement.probabilitArray)
            return mergedDataElement.portion * mergedDataElementEntropy
        })

        // InfoT dla konkretnej kolumny
        const columnInfo = infoValuesArray.reduce((a, b) => a+ b, 0)

        infoArrayForAllData.push(columnInfo)

        const arrayForSplitInfo = mergedData.map(mergedDataElement => mergedDataElement.portion)

        // SplitInfo dla konkretnej kolumny
        const splitInfo = entropy(arrayForSplitInfo)
        splitInfoArray.push(splitInfo)
    }

    // info dla elementów decyzyjnych
    const infoT = entropy(decisionElementsProbability)

    // Gain
    const gainArray = infoArrayForAllData.map(info => infoT - info)

    // Gain ratio
    const gainRatioArray = gainArray.map((gainElement, index) => {
        return gainElement/splitInfoArray[index]
    })

})

