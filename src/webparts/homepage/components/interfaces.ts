export interface IListState {
    items: IListItem[];
    header: string;
    content: string;
    author: string;
    renderList: boolean;
}

// create item to work with it internally
export interface IListItem {
    Id: number;
    Title: string;
    Content: string;
    Author0: string;
    Created: Date;
    header: string;
  }
   
  // create PnP JS response interface for Item
  export interface IResponseItem {
    Id: number;
    Title: string;
    Content: string;    
    Author0: string;
    Created: Date;
  }
