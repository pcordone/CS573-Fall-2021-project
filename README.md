# Data Visualization Project CS573 Fall 2021 Peter Cordone

## Data

The data I propose to visualize for my project is electrical usage data for multiple accounts for two years by month.  The dataset can be found here https://gist.github.com/pcordone/93039d5d909fbf42838c5167219d6ed4.

## Prototypes

Below is a screenshot of a scatter plot of the data for electrical usage for my personal accounts.  I live in an owner occupied 3 family and you can see the usage for two of the apartments that I occupy and the common meter which provides power for the rear and front LED lighting, basement outlets and outside outlets.  I have electric heat pumps that I use to cool in the summer and offset oil consumption in the winter.

[![image](https://user-images.githubusercontent.com/447806/133937864-d8a5d491-8e60-4cfc-a4cc-e4a9f931c23c.png)](https://user-images.githubusercontent.com/447806/133937864-d8a5d491-8e60-4cfc-a4cc-e4a9f931c23c.png)

https://vizhub.com/pcordone/88ab7f8fa4404167af3b1866e3fcd70f

## Questions & Tasks

The visualization and interactions are intended to answer the following questions:

 * How does electricity usage vary over seasons of a year?
 * How does usage compare across two years for each month and season?
 * How does usage compare across accounts by season?
 * How has the cost of electricity change compared to usage (i.e. what effect has rate increases had)?
 * What does net metered usage (solar generated power) compare to total usage by account and by season?

## Sketches

This visualization sketch shows a stacked bar graph wrapped around a circle representing the usage for the 12 months of the year for 3 accounts.  The rationale is that by wrapping the bar graph around a circle, the viewer can look to the opposite side of the circle to see usage patterns for the opposite season.  The visualization could also show usage for the same account with the bars closer to the origin for the first year and the bars further from the origin for the second year.  Multiple accounts could also be rendered for two consecutive years by grouping the accounts visually as groups of consecutive circles of accounts.  An issue with this visualization is that the area of segments will increase if the height of the bars represent usage.  That may be perceived as misleading since it will cause the user to believe that the outer bar segments are consuming more electricity.

[![image](https://user-images.githubusercontent.com/447806/133938224-1bc1bfc5-3cd1-439e-a079-243d89931b48.png)](https://user-images.githubusercontent.com/447806/133938224-1bc1bfc5-3cd1-439e-a079-243d89931b48.png)

By rendering the bars as rectangular instead of pie shaped, the issue of the area of the bars increasing as segments are further out is removed.

[![image](
https://user-images.githubusercontent.com/447806/133938231-ae7a1b6b-bd14-46a2-b126-a578d11f0b41.png)](
https://user-images.githubusercontent.com/447806/133938231-ae7a1b6b-bd14-46a2-b126-a578d11f0b41.png)

I would also like to add interactivity where the user can select accounts to show, adjust the period the circumference covers, and select wheter to show net metering credits or not.

## Open Questions

Once concern is I don't have a lot of data (twenty four points for each account).  I also don't have data for a wide variety of accounts publically availabe to render the visualization with.  I am working on getting a larger dataset from work that can be made publically available.  I could test it out on datasets at work and likely capture the rendering without concern of exposing information.
