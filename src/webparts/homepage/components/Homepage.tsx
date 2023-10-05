import * as React from 'react';
//import styles from './Homepage.module.scss';
import type { IHomepageProps } from './IHomepageProps';
import { Logger, LogLevel } from "@pnp/logging";
import { Caching } from "@pnp/queryable";
import { SPFI, spfi } from "@pnp/sp";
import { IListItem, IListState, IResponseItem } from './interfaces'
import { getSP } from '../pnpjsConfig';
import { PrimaryButton  } from '@fluentui/react';
import  PostDialog from './PostDialog'
import dayjs from 'dayjs';
import styles from './Homepage.module.scss'

export default class Homepage extends React.Component<IHomepageProps, IListState> {

   
  private LOG_SOURCE = "🅿PnPjsExample";
  private _sp: SPFI;  

  constructor(props:IHomepageProps){
    super(props);

    this.state = {
      items: [],
      header: '',
      content:'',
      author:'',
      renderList: false
  }; 
    this._sp = getSP();
  }


  public render(): React.ReactElement<IHomepageProps> {
    const {
      listName,
      company,
      userDisplayName,
      intranetUrl,
      publicSite
    } = this.props;

    console.log("intranetUrl " +intranetUrl + " listname "+ listName );

    let shortTime = "";

    if(company === userDisplayName){
    return (
      <section> 
      <div className={styles.buttonMargin}>       
        <span className={styles.someSpace}><PrimaryButton text="Skapa inlägg" title="Skapa inlägg" onClick={this._createPost} /> </span>
        <span className={publicSite? undefined : styles.hidden }><PrimaryButton text="Intranät" title="Intranät" href={intranetUrl} /></span>     
      </div>  
        {this.state.items.map((item: any) => (
            shortTime = dayjs(item.Created).format("HH:mm"),
            <article>              
              <h1>{item.Title}</h1>               
              <p className={styles.content}>{item.Content}</p>
              <span>{shortTime}</span> <span>{item.Author0}</span>                       
            </article>
          ))}             
      </section>
    )} else {
      return (
        <section> 
          {this.state.items.map((item: any) => (
              shortTime = dayjs(item.Created).format("HH:mm"),
              <article>              
                <h1>{item.Title}</h1>               
                <p className={styles.content}>{item.Content}</p>
                <span>{shortTime}</span> <span>{item.Author0}</span>                       
              </article>
            ))}             
        </section>
    )}
  }

  private _createPost = async (): Promise<void> => {
    const taskDialog = new PostDialog(      
      async (header, content, author) => {},
      async () => alert('You closed the dialog!'),
      this.props.listName
    );
    this.setState({renderList: true});
    taskDialog.show();  
  }

  private _readAllListItems = async(): Promise<void> => {
    try{
      const spCache = spfi(this._sp).using(Caching({store:"session"}));
        console.log("I _readall")

      const response: IListItem[] = await spCache.web.lists
        .getByTitle(this.props.listName)
        .items
        .select("Id", "Title", "Content", "Author0", "Created")
        .orderBy("Created", false)();

      // use map to convert IResponseItem[] into our internal object IFile[]
      const items: IListItem[] = response.map((item: IResponseItem) => {
        return {
          Id: item.Id,
          Title: item.Title,
          Content: item.Content,
          Author0: item.Author0,
          Created: item.Created,
          header:""
        };
      });
      this.setState({items});
      console.log("items: " +items);
    }
    catch(err){
      Logger.write(`${this.LOG_SOURCE} (_readAllKwitterItems) - ${JSON.stringify(err)} - `, LogLevel.Error);
    }
  }

  componentDidMount(): void {
    this._readAllListItems();
  }
}
