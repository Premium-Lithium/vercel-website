export default function chunkArray<T>(
    myArray: Array<T>,
    chunkSize: number
): Array<Array<T>> {
    if (!myArray.length) {
        return [];
    }
    const result = [myArray.slice(0, chunkSize)].concat(chunkArray(myArray.slice(chunkSize), chunkSize));
    return result
}
