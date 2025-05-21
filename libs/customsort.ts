import { Song } from "@/types";

interface Item {
    [x: string]: any;
  }


export function customSort(arr:Item[], order:string[]) {
    const orderMap = new Map(order.map((id,index) => [id, index]));
    // console.log(order)
    return arr.sort((a, b) => {
        //  string IDs to numbers for comparison
        const indexA = orderMap.get(a.id);
        const indexB = orderMap.get(b.id);
        // console.log(indexA,indexB)
        // If both IDs are in the orderArray, sort based on their order
        if (indexA !== undefined && indexB !== undefined) {
          return indexA - indexB;
        }
        
        // If only one ID is in the orderArray, prioritize it
        if (indexA !== undefined) return -1;
        if (indexB !== undefined) return 1;
        
        // If neither ID is in the orderArray, maintain their original order
        return 0;
      }) as Song[];
  }