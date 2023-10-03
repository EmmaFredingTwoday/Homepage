import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styles from './Homepage.module.scss';
import { IPostDialogProps } from './IPostDialogProps';
import { IPostDialogState } from './IPostDialogState';
import { IItemAddResult } from '@pnp/sp/items';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
    TextField,
    DefaultButton,
    PrimaryButton,
    DialogFooter,
    DialogContent
} from '@fluentui/react/lib';
import { SPFI, spfi } from "@pnp/sp";
import { getSP } from '../pnpjsConfig';
import { Logger, LogLevel } from "@pnp/logging";
import { Caching } from "@pnp/queryable";

class TaskDialogContent extends React.Component<IPostDialogProps, IPostDialogState> {

    constructor(props: IPostDialogProps) {
        super(props);

        this.state = {
            header: '',
            content:'',
            author:''
        };        
    }
    
    public render(): JSX.Element {
        return (<div>
            <DialogContent
                title="Skriv inlägg"
                onDismiss={this.props.onClose}
                className={styles.dialog}>
            <div>
                <div>
                    <TextField label="Rubrik"
                        onChange={this._onheaderChange}
                        value={this.state.header} />
                    <TextField label="Innehåll"
                        rows={10}
                        multiline={true}
                        onChange={this._onContentChange}
                        value={this.state.content} />
                    <TextField label="Författare"
                        onChange={this._onAuthorChange}
                        value={this.state.author} />
                </div>
            </div>

            <DialogFooter>
                <DefaultButton text="Cancel"
                        title="Cancel" onClick={this.props.onClose} />
                <PrimaryButton text="Skapa inlägg"
                        title="Skapa inlägg" onClick={async () => { await this.props.onSave(this.state.header!, this.state.content!, this.state.author!); }} />
            </DialogFooter>
        </DialogContent>
    </div>);
    }

    private _onheaderChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        this.setState({ header: newValue });
    }

    private _onContentChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        this.setState({ content: newValue });
    }

    private _onAuthorChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        this.setState({ author: newValue });
    }
}

export default class PostDialog extends BaseDialog {
    private _sp: SPFI; 
    private LOG_SOURCE = "🅿PnPjsExample";
    /**
     * Constructor for the dialog window
     */
    constructor(
        public onSave: (header: string, content: string, author: string) => Promise<void>,
        public onClose: () => Promise<void>) {
        super({isBlocking: true});        
        this._sp = getSP();
    }
  
    public render(): void {
        ReactDOM.render(<TaskDialogContent
                onSave={this._save}
                onClose={this._close}
            />,
            this.domElement);
    }
  
    public getConfig(): IDialogConfiguration {
      return {
        isBlocking: true
      };
    }

    protected onAfterClose(): void {
        ReactDOM.unmountComponentAtNode(this.domElement);
    }

    private _save = async (header: string, content: string, author: string ): Promise<void> => {
        try{
            const spCache = spfi(this._sp).using(Caching({store:"session"}));
              const iar:IItemAddResult = await spCache.web.lists.getById('5e2a5dd4-1b38-425a-bf24-15caa44266c5').items.add({
                  Title: header || "Unknown",
                  Content: content || "Unknown",
                  Author0: author || "Unknown" 
                })
                console.log(iar);
            } 	
            catch(err){
            Logger.write(`${this.LOG_SOURCE} (_save) - ${JSON.stringify(err)} - `, LogLevel.Error);
        }        
        await this.onSave(header, content, author);
        await this.close();
    }
  
    private _close = async (): Promise<void> => {
        await this.close();
        await this.onClose();
    }
}