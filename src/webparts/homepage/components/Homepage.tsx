import * as React from 'react';
import type { IHomepageProps } from './IHomepageProps';
import { Logger, LogLevel } from "@pnp/logging";
import { SPFI } from "@pnp/sp";
import { IListItem, IListState, IResponseItem } from './interfaces'
import { getSP } from '../pnpjsConfig';
import { PrimaryButton } from '@fluentui/react';
import PostDialog from './PostDialog'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);


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
      // listName,
      company,
      userDisplayName,
      intranetUrl,
      publicSite
    } = this.props;

    const articleStyle = {
      padding: '15px',
      borderBottom: '1px solid #e5e5e5'
    };

    const h1Style = {
      fontSize: '24px',
      margin: '10px 0'
    };

    const pStyle = {
      margin: '10px 0',
      lineHeight: '1.5'
    };

    let shortTime = "";

    if(company === userDisplayName) {
      return (
        <section style={{ fontFamily: 'Arial, sans-serif' }}>
          <div style={{ textAlign: 'center', margin: '10px 0 30px' }}>
            <span style={{ margin: '0 15px' }}>
              <PrimaryButton text="Skapa inlägg" title="Skapa inlägg" onClick={this._createPost} />
            </span>
            {publicSite && <PrimaryButton text="Intranät" title="Intranät" href={intranetUrl} />}
          </div>  

          {this.state.items.map((item: any) => (
            shortTime = dayjs(item.Created).fromNow(),
            <article style={articleStyle}>              
              <h1 style={h1Style}>{item.Title}</h1>
              <p style={pStyle}>{item.Content}</p>
              <span>{shortTime}</span> <span>{item.Author0}</span>
            </article>
          ))}
        </section>
      )
    } else {
      return (
        <section style={{ fontFamily: 'Arial, sans-serif' }}>
          {this.state.items.map((item: any) => (
              shortTime = dayjs(item.Created).fromNow(),
              <article style={articleStyle}>              
                <h1 style={h1Style}>{item.Title}</h1>               
                <p style={pStyle}>{item.Content}</p>
                <span>{shortTime}</span> <span>{item.Author0}</span>                       
              </article>
            ))}
        </section>
      )
    }
  }

  private _createPost = async (): Promise<void> => {
    const taskDialog = new PostDialog(      
      async (header, content, author) => {
        // Once the post has been made, fetch the latest list items.
        await this._readAllListItems();
      },
      async () => alert('You closed the dialog!'),
      this.props.listName
    );
    this.setState({renderList: true});
    taskDialog.show();  
  }

  private _readAllListItems = async(): Promise<void> => {
    try{
      const response: IListItem[] = await this._sp.web.lists
        .getByTitle(this.props.listName)
        .items
        .select("Id", "Title", "Content", "Author0", "Created")
        .orderBy("Created", false)();

      const items: IListItem[] = response.map((item: IResponseItem) => {
        return {
          Id: item.Id,
          Title: item.Title,
          Content: item.Content,
          Author0: item.Author0,
          Created: item.Created,
          header: ""
        };
      });
      this.setState({items});
    }
    catch(err){
      Logger.write(`${this.LOG_SOURCE} (_readAllKwitterItems) - ${JSON.stringify(err)} - `, LogLevel.Error);
    }
  }

  componentDidMount(): void {
    this._readAllListItems();
  }
}
