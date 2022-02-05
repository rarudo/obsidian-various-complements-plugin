import {
  App,
  ButtonComponent,
  DropdownComponent,
  ExtraButtonComponent,
  Modal,
  Notice,
  TextAreaComponent,
  TextComponent,
} from "obsidian";
import { mirrorMap } from "../util/collection-helper";
import { Word } from "../provider/suggester";
import { AppHelper } from "../app-helper";

export class CustomDictionaryWordRegisterModal extends Modal {
  currentDictionaryPath: string;
  value: string;
  description: string;
  aliases: string[];

  wordTextArea: TextAreaComponent;
  button: ButtonComponent;
  openFileButton: ExtraButtonComponent;

  constructor(
    app: App,
    dictionaryPaths: string[],
    initialValue: string = "",
    onClickAdd: (dictionaryPath: string, word: Word) => void
  ) {
    super(app);
    const appHelper = new AppHelper(app);
    this.currentDictionaryPath = dictionaryPaths[0];
    this.value = initialValue;

    this.titleEl.setText("Add a word to a custom dictionary");

    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h4", { text: "Dictionary" });
    new DropdownComponent(contentEl)
      .addOptions(mirrorMap(dictionaryPaths, (x) => x))
      .onChange((v) => {
        this.currentDictionaryPath = v;
      });
    this.openFileButton = new ExtraButtonComponent(contentEl)
      .setIcon("enter")
      .setTooltip("Open the file")
      .onClick(() => {
        const markdownFile = appHelper.getMarkdownFileByPath(
          this.currentDictionaryPath
        );
        if (!markdownFile) {
          new Notice(`Can't open ${this.currentDictionaryPath}`);
          return;
        }

        this.close();
        appHelper.openMarkdownFile(markdownFile, true);
      });
    this.openFileButton.extraSettingsEl.setAttribute(
      "style",
      "display: inline"
    );

    contentEl.createEl("h4", { text: "Word" });
    this.wordTextArea = new TextAreaComponent(contentEl)
      .setValue(this.value)
      .onChange((v) => {
        this.value = v;
        this.button.setDisabled(!v);
        if (v) {
          this.button.setCta();
        } else {
          this.button.removeCta();
        }
      });
    this.wordTextArea.inputEl.setAttribute("style", "min-width: 100%;");

    contentEl.createEl("h4", { text: "Description" });
    new TextComponent(contentEl)
      .onChange((v) => {
        this.description = v;
      })
      .inputEl.setAttribute("style", "min-width: 100%;");

    contentEl.createEl("h4", { text: "Aliases (for each line)" });
    new TextAreaComponent(contentEl)
      .onChange((v) => {
        this.aliases = v.split("\n");
      })
      .inputEl.setAttribute("style", "min-width: 100%;");

    this.button = new ButtonComponent(
      contentEl.createEl("div", {
        attr: {
          style: "display: flex; justify-content: center; margin-top: 15px",
        },
      })
    )
      .setButtonText("Add to dictionary")
      .setCta()
      .setDisabled(!this.value)
      .onClick(() => {
        onClickAdd(this.currentDictionaryPath, {
          value: this.value,
          description: this.description,
          aliases: this.aliases,
          type: "customDictionary",
        });
      });
    if (this.value) {
      this.button.setCta();
    } else {
      this.button.removeCta();
    }
  }
}
