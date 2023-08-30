# diyBetTracker
###  Backend was created using Java (Springboot) and frontend is JavaScript, HTML, CSS  
Welcome to the Bet Profit and Loss Tracker! This application is designed to help you effortlessly keep track of your betting activities, providing a clear overview of your profits and losses. This app simplifies the process of managing your bets and evaluating your performance.

## If you would like to login to the website to see if for yourself, I am hosting it here: https://bets.gibsonkyle.com - the user is "test" and the password is "testUser123?!"

## Features

- **Track Bets**: Easily input details of each bet you place, including the event, amount wagered, odds, and outcome.

- **Profit and Loss Visualization**: Instantly see how your bets are performing on the dashboard through clear visualizations of your overall profit and loss.

- **Custom Tags**: Tag your bets by sport, event type, or any other criteria that matter to you.

- **User-Friendly Interface**: Intuitive design and user-friendly interface make it easy to enter and review your bets.

## Screenshots

**Dashboard**:
  ![dashboard github](https://github.com/kylergib/diyBetTracker/assets/48994502/50bad5e5-a3fd-45ad-a93a-a970482012e0)
- 1: Stats that show up on all pages to display profits at a quick glance.
- 2: Tag combinations you want to see. You can add or remove tag combinations in settings. Currently, it will display total profits for the tag combination. I would like to show profits for the year, month, or day in the future.
- 3: A calendar widget that displays profit by the day.
- 4: Shows the amount of money in pending/open bets and how many open bets you have.
  - The number of open bets does not match the pending amount because the open bets were from the previous month. This is a test account where I have disabled the test user from making changes.
- 5: Shows profits for each tag. Currently, it will display total profits for this tag. I would like to show profits for the year, month, or day in the future.
- 6: Shows profits for each sportsbook. Currently, it will display total profits for this tag. I would like to show profits for the year, month, or day in the future.
- 7: The entire lines show various stats according to the title of the panel.
- 8: A chart that shows profits for each day within a month. It's redundant because of the calendar; may be removed in a future release.
- 9: A chart that shows profits for each month within a year.

**Bet Page**
![bet github](https://github.com/kylergib/diyBetTracker/assets/48994502/db216206-ac26-4590-b6f8-d80ae40e87bb)
- 1: Stats that show up on all pages to display profits at a quick glance.
- 2: Filter button that opens a container, allowing you to select filters for the bet table by tags, sportsbook, status, stake amount, and odds amount.
- 3: Quickly switch between viewing bets from the day, week, or month. You can also select a custom date by clicking on the date (Aug 1, 2023 - Aug 31, 2023). The previous/next buttons will navigate to the next day, week, or month based on the selected option.
  - By default, the page opens to the selected day, not the month.
- 4: Bet table displaying all of the bets.
- 5: Button to add bet.

**Add Bet**
![Screenshot 2023-08-30 at 4 04 50 PM](https://github.com/kylergib/diyBetTracker/assets/48994502/e479cd19-e611-4d54-9996-654057599901)
- Here, you can enter the bet details. Most of the inputs are self-explanatory. However, for the "Keep Sportsbook," "Keep Date," "Keep Status," and "Keep Tags" options at the top, if any of them are selected, clicking save will not refresh the window. Instead, it will save the bet and retain the data, making it easier to enter bets with similar information.

**Settings**
![settings github](https://github.com/kylergib/diyBetTracker/assets/48994502/21d2216f-1d0d-45ea-845d-9a7f772382a2)
- 1: Stats that show up on all pages to display profits at a quick glance.
- 2: Select custom tags you want to track on the dashboard.
- 3: Clear the selected tags. Add the selected tags to your dashboard. Once added, they will be displayed in the next panel.
- 4: Displays custom tags you want to track.
- 5: By selecting tag combinations from above and then clicking remove, you can remove those combinations from your dashboard.
- 6: Save the changes. Removing tag combinations automatically saves, but adding them does not.




## Future functionality
#### Everything in this list is a wishlist, and I may or may not get to all of the features.
- **Export and Reporting**: Generate detailed reports for specific time periods, helping you analyze your progress and make informed decisions.
- **Statistics**: Gain insights into your betting habits with statistics that highlight your win rate, average odds, and more.
- **Settings**: The ability to add additional settings (unit size, light or dark mode, user signups, hidden panels, customer tracking with tags+sportsbooks)
- **Dashboard**: Add date ranges to the tags and sportsbook profit on dashboard.
- **Bet Table**: Add buttons to be able to apply bulk actions to the selection buttons.
