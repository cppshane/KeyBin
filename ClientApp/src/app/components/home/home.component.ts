import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { WebSocketService } from '../../services/web-socket.service';
import { SocialUser, AuthService, GoogleLoginProvider } from 'angularx-social-login';
import { KeyCategory } from '../../models/key-category.model';
import { KeyGroupType } from '../../enums/key-group-type.enum';


declare const VANTA: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private httpService: HttpService, private authService: AuthService) { }


  // Constants

  introPageState = 1;
  contentPageState = 2;


  // Fields

  vantaEffect;
  vantaDestroyed = false;

  user: SocialUser;

  keyCategories: Array<KeyCategory> = [];

  _selectedKeyCategory: KeyCategory;

  set selectedKeyCategory(value: KeyCategory) {
    this._selectedKeyCategory = value;

    this.resetFilter();
  }

  get selectedKeyCategory() {
    return this._selectedKeyCategory;
  }

  searchText: string;

  keyGroupFocusStates = new Array<boolean>();
  keyGroupDisplayStates = new Array<string>();
  keyItemDisplayStates = new Array<Array<string>>();

  pageState = this.introPageState;

  introPageDisplayStyle = '';
  contentPageDisplayStyle = 'none';

  loginButtonsDisplayStyle = '';
  userInfoDisplayStyle = 'none';


  // Interface Functions

  ngOnInit() {
    this.initVantaEffect();

    this.authService.authState.subscribe((user) => {
      this.user = user;

      if (this.user == undefined) {
        this.updatePageContentVisualState(this.introPageState);

        this.httpService.idToken = undefined;
      }
      else {
        this.httpService.idToken = this.user.idToken;
      }

      this.updateUserLoginWebSocketState();

      this.updateUserLoginVisualState();

      this.downloadUserKeyCategories();
    });

    WebSocketService.homeComponent = this;
    WebSocketService.startSocket();
  }


  // Events

  keyCategoryDatabaseUpdate(keyCategory: KeyCategory) {
    const index = this.keyCategories.findIndex(keyCategoryIndex => keyCategoryIndex.Id === keyCategory.Id);
    
    if (index !== -1) {
      if (this.selectedKeyCategory.Id === this.keyCategories[index].Id) {
        this.uiSafeSelectedKeyCategoryUpdate(keyCategory);
        this.resetFilter();
      }
      else
        Object.assign(this.keyCategories[index], keyCategory);
    }
    else {
      this.keyCategories.push(keyCategory);
    }
  }

  keyCategoryDatabaseDelete(keyCategoryIn: KeyCategory) {
    const index = this.keyCategories.findIndex(keyCategory => keyCategory.Id === keyCategoryIn.Id);

    if (index !== -1) {
      this.keyCategories.splice(index, 1);
    }
  }

  keyGroupChange() {
    this.uploadKeyCategory(this.selectedKeyCategory);
  }

  keyGroupClick(keyGroupInput) {
    for (const [keyGroupIndex, keyGroup] of this.selectedKeyCategory.KeyGroups.entries()) {
      if (keyGroup.Id !== keyGroupInput.KeyGroup.Id)
        this.keyGroupFocusStates[keyGroupIndex] = false;
      else
        this.keyGroupFocusStates[keyGroupIndex] = true;
    }
  }

  searchTextChange() {
    this.filterSelectedKeyCategory(this.searchText.toLowerCase());
  }

  keyCategoryItemClick(keyCategory: KeyCategory) {
    this.selectedKeyCategory = keyCategory;

    this.updatePageContentVisualState(this.contentPageState);
  }

  deleteKeyCategoryButtonClick(event, keyCategory: KeyCategory) {
    if (this.selectedKeyCategory.Id === keyCategory.Id)
      this.updatePageContentVisualState(this.introPageState);

    this.httpService.deleteKeyCategory(keyCategory.Id);

    this.stopEvent(event);
  }

  newKeyCategoryButtonClick() {
    if (this.user != undefined)
      this.httpService.createKeyCategory();
  }

  newKeyGroupButtonClick() {
    this.httpService.createKeyGroup(this.selectedKeyCategory.Id, KeyGroupType.Key);
  }

  newCommandGroupButtonClick() {
    this.httpService.createKeyGroup(this.selectedKeyCategory.Id, KeyGroupType.Command);
  }

  keyCategoryTitleChange() {
    this.uploadKeyCategory(this.selectedKeyCategory);
  }


  // Functions

  downloadUserKeyCategories() {
    if (this.user != undefined) {
      this.httpService.getKeyCategories((result) => {
        this.keyCategories = result;
      });
    }
    else {
      this.keyCategories = [];
    }
  }

  uploadKeyCategory(keyCategory: KeyCategory) {
    this.httpService.updateKeyCategory(keyCategory);
  }

  updateUserLoginWebSocketState() {
    WebSocketService.sendMessage(this.user == undefined ? undefined : this.user.idToken);
  }

  filterSelectedKeyCategory(filterString: string) {
    for (const [keyGroupIndex, keyGroup] of this.selectedKeyCategory.KeyGroups.entries()) {
      let keepGroup = false;

      if (filterString === '')
        keepGroup = true;

      if (keyGroup.Title.toLowerCase().includes(filterString))
        keepGroup = true;

      for (const [keyItemIndex, keyItem] of keyGroup.KeyItems.entries()) {
        if (keyItem.Content.toLowerCase().includes(filterString) || keyItem.Description.toLowerCase().includes(filterString)) {
          this.keyItemDisplayStates[keyGroupIndex][keyItemIndex] = '';

          keepGroup = true;
        }
        else
          this.keyItemDisplayStates[keyGroupIndex][keyItemIndex] = 'none';
      }

      if (!keepGroup)
        this.keyGroupDisplayStates[keyGroupIndex] = 'none';
      else
        this.keyGroupDisplayStates[keyGroupIndex] = '';
    }
  }

  userSignIn() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  userSignOut() {
    this.authService.signOut();
  }

  updateUserLoginVisualState() {
    if (this.user != undefined) {
      this.loginButtonsDisplayStyle = 'none';
      this.userInfoDisplayStyle = 'initial';
    }
    else {
      this.loginButtonsDisplayStyle = 'initial';
      this.userInfoDisplayStyle = 'none';
    }
  }

  updatePageContentVisualState(newContentPageState) {
    if (newContentPageState === this.contentPageState) {
      this.introPageDisplayStyle = 'none';
      this.contentPageDisplayStyle = '';

      this.vantaEffect.destroy();
      this.vantaDestroyed = true;

      this.pageState = newContentPageState;
    }
    else if (newContentPageState === this.introPageState) {
      this.introPageDisplayStyle = '';
      this.contentPageDisplayStyle = 'none';

      if (this.vantaDestroyed)
      this.initVantaEffect();

      this.pageState = this.introPageState;
    }
  }

  uiSafeSelectedKeyCategoryUpdate(keyCategory: KeyCategory) {
    this.selectedKeyCategory.Title = keyCategory.Title;

    // Remove deleted KeyGroups
    for (const [keyGroupIndex, keyGroup] of this.selectedKeyCategory.KeyGroups.entries()) {
      const foundGroupIndex = keyCategory.KeyGroups.findIndex(keyGroupIndexer => keyGroupIndexer.Id === keyGroup.Id);

      if (foundGroupIndex === -1)
        this.selectedKeyCategory.KeyGroups.splice(keyGroupIndex, 1);
    }

    for (const keyGroup of keyCategory.KeyGroups) {
      const foundGroupIndex = this.selectedKeyCategory.KeyGroups.findIndex(keyGroupIndexer => keyGroupIndexer.Id === keyGroup.Id);

      // Add new KeyGroup
      if (foundGroupIndex === -1)
        this.selectedKeyCategory.KeyGroups.push(keyGroup);

      // Update existing KeyGroups
      else {
        this.selectedKeyCategory.KeyGroups[foundGroupIndex].Title = keyGroup.Title;

        const foundGroup = this.selectedKeyCategory.KeyGroups[foundGroupIndex];

        // Remove deleted KeyItems
        for (const [keyItemIndex, keyItem] of foundGroup.KeyItems.entries()) {
          const foundItemIndex = keyGroup.KeyItems.findIndex(keyItemIndexer => keyItemIndexer.Id === keyItem.Id);

          if (foundItemIndex === -1)
            this.selectedKeyCategory.KeyGroups[foundGroupIndex].KeyItems.splice(keyItemIndex, 1);
        }

        for (const [keyItemIndex, keyItem] of keyGroup.KeyItems.entries()) {
          const foundItemIndex = foundGroup.KeyItems.findIndex(keyItemIndexer => keyItemIndexer.Id === keyItem.Id);

          // Add new KeyItem
          if (foundItemIndex === -1)
            this.selectedKeyCategory.KeyGroups[foundGroupIndex].KeyItems.splice(keyItemIndex, 0, keyItem);

          // Update existing KeyItems
          else {
            this.selectedKeyCategory.KeyGroups[foundGroupIndex].KeyItems[foundItemIndex].Content = keyItem.Content;
            this.selectedKeyCategory.KeyGroups[foundGroupIndex].KeyItems[foundItemIndex].Description = keyItem.Description;
          }
        }

      }
    }
  }

  resetFilter() {
    this.searchText = "";

    if (this.selectedKeyCategory == undefined)
      return;

    if (this.selectedKeyCategory.KeyGroups == undefined)
      return;

    this.keyGroupDisplayStates = new Array<string>();
    this.keyItemDisplayStates = new Array<Array<string>>();

    for (const [keyGroupIndex, keyGroup] of this.selectedKeyCategory.KeyGroups.entries()) {
      this.keyItemDisplayStates.push(new Array<string>());

      for (const keyItem in keyGroup.KeyItems)
        this.keyItemDisplayStates[keyGroupIndex].push('');

      this.keyGroupDisplayStates.push('');
    }
  }

  initVantaEffect() {
    this.vantaEffect = VANTA.NET({
      el: '#page-intro-wrapper-background',
      mouseControls: true,
      touchControls: true,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x165a7a,
      backgroundColor: 0x202b33,
      points: 10.00
    });
    this.vantaDestroyed = false;
  }

  stopEvent(event) {
    event.stopPropagation();
    event.preventDefault();
    event.cancelBubble = true;
  }
}


