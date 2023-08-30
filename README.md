# diyBetTracker
###  Backend was created using Java (Springboot) and frontend is JavaScript, HTML, CSS  
Welcome to the Bet Profit and Loss Tracker! This application is designed to help you effortlessly keep track of your betting activities, providing a clear overview of your profits and losses. This app simplifies the process of managing your bets and evaluating your performance.

## Features

- **Track Bets**: Easily input details of each bet you place, including the event, amount wagered, odds, and outcome.

- **Profit and Loss Visualization**: Instantly see how your bets are performing on the dashboard through clear visualizations of your overall profit and loss.

- **Custom Tags**: Tag your bets by sport, event type, or any other criteria that matter to you.

- **User-Friendly Interface**: Intuitive design and user-friendly interface make it easy to enter and review your bets.

## Screenshots

**Dashboard**:
  ![dashboard github](https://github.com/kylergib/diyBetTracker/assets/48994502/50bad5e5-a3fd-45ad-a93a-a970482012e0)
- 1: Stats that show up on all pages to see profits at a quick glance.
- 2: Tag combinations that you want to see. You can add or remove tag combinations in settings. Currently will display total profits on this tag. Would like to show profits for year, month or day in the future.
- 3: A calendar widget that will show profit by the day.
- 4: Shows amount of money in pending/open bets and how many open bets you have.
  - The amount of open bets does not match with the pending amount because the bets were from the previous month. This is a test account where I have disabled the test user from making changes.
- 5: Shows profits for each tag. Currently will display total profits on this tag. Would like to show profits for year, month or day in the future.
- 6: Shows profits for each sportsbook. Currently will display total profits on this tag. Would like to show profits for year, month or day in the future.
- 7: The entire lines show various stats according to title of the panel.
- 8: A chart that shows profits for each day within a month. Is redundant because of the calendar, may remove in future release.
- 9: A chart that shows profits for each month within a year.

**Bet Page**
![bet github](https://github.com/kylergib/diyBetTracker/assets/48994502/db216206-ac26-4590-b6f8-d80ae40e87bb)
- 1: Stats that show up on all pages to see profits at a quick glance.
- 2: Filter button that opens and you can select to filter the bet table by tags, sportsbook, status, stake amount and odds amount.
- 3: Quickly switch from seeing bets from the day, week or month. Can select a custom date by clicking on the date (Aug 1,2023 - Aug 31, 2023). The previous/next buttons will go the next day, week or month, depending on what is selected.
  - By default the page opens to the day being selected and not the month.
- 4: Bet table that shows all of the bets.
- 5: Button to add bet.

**Add Bet**
![Screenshot 2023-08-30 at 4 04 50 PM](https://github.com/kylergib/diyBetTracker/assets/48994502/e479cd19-e611-4d54-9996-654057599901)
- Here you can enter in the bet details, most of the inputs are self explanatory, but for the keep sportsbook, keep date, keep status and keep tags at the top, if any of them are selected once you click save the window will not refresh and it will save the bet and keep the data to easily be able to enter in bets that have similar information.

**Settings**
![settings github](https://github.com/kylergib/diyBetTracker/assets/48994502/21d2216f-1d0d-45ea-845d-9a7f772382a2)
- 1: Stats that show up on all pages to see profits at a quick glance.
- 2: Select custom tags that you want to track in the dashboard.
- 3: Clear the selected tags. Add the selected tags to your dashboard. Once added they will show in the next panel.
- 4: Displays custom tags that you want to track. 
- 5: Selecting the combination of tags from aboce and then clicking remove will remove the combination of tags from your dashboard.
- 6: Save the changes. Removing tag combinations automatically save, but adding them does not.




## Future functionality
#### Everything in this list is a wishlist, and I may or may not get to all of the features.
- **Export and Reporting**: Generate detailed reports for specific time periods, helping you analyze your progress and make informed decisions.
- **Statistics**: Gain insights into your betting habits with statistics that highlight your win rate, average odds, and more.
- **Settings**: The ability to add additional settings (unit size, light or dark mode, user signups, hidden panels, customer tracking with tags+sportsbooks)
- **Dashboard**: Add date ranges to the tags and sportsbook profit on dashboard.
- **Bet Table**: Add buttons to be able to apply bulk actions to the selection buttons.
