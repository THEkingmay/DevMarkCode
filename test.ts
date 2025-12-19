const a : number[] = [1,2,3,4,5]
const b : number[]=[3,4,5,6,7]

const isAllIn = b.every(item => a.includes(item))

console.log(isAllIn)