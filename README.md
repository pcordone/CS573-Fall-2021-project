# Data Visualization Project CS573 Fall 2021 Peter Cordone

## Visualization Description, Background Information and Goals

The goal of creating this visualization is to provide an interactive tool that will allow a user to explore electrical usage data and look for cyclical patterns of usage.  Electrical usage to a home or business is measured by a meter and understanding usage patterns is critical to energy conservation, integrating renewables and non fossile fuel heating[1].  Each meter is assocciated with an account to track usage and bill customers.  Energy consumption is measured in kilo watts or thousands of watts (abreviated kW) and power consumption or energy consumed over time is measured in kilo watt hours (abbreviated kWH).  A load is defined as an electrical device that draws power from the electrical system.  Electrical energy consist of voltage, or electromotive force, that causes current which is the movement of electrons.  Power is transferred from the electrical grid to the device through teh flow of these electrons.  If the voltage and current are in phase, then the load is purely resistive.  It is possible for voltage and current to be out of phase, meaning that energy is flowing from the grid into the load but then back out from the load and into the grid.  While the load has not consumed the energy, the movement of electrons in the electrical system does consume energy so it is important to also measure electrical power that is out of phase.  This measurement is knows as reactive power and indicated by kilo volt amps reactiave or kVAR.  Air conditioning equipment in particular provides reactive load challenges for the electrical system.

I started with my personal electrical consumption across three accounts that belong to me (I live on two floors of a three family and the third account is for the common circuit providing power for outdoor outlets, the basement workshop and common hallway lighting).  Since my personal dataset was limited to 24 months and only montly data, I pivoted to a dataset that was published as a part of the paper [C. J. Meinrenken et al., “MFRED, 10 second interval real and reactive power for groups of 390 US apartments of varying size and vintage,” Sci Data, vol. 7, no. 1, p. 375, Nov. 2020, doi: 10.1038/s41597-020-00721-w](https://www.nature.com/articles/s41597-020-00721-w).  The full dataset is sampled from over 300 homes of 26 different multifamily housing types every 10 seconds for a full year.  A fifteen minute aggregation of the data is at [MFRED (public file, 15/15 aggregate version): 10 second interval real and reactive power in 390 US apartments of varying size and vintage](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/X9MIDJ) and I chose to use that dataset since it is more manageable.

## Questions & Tasks

I plan on supporting the following interractions to answer the following questions:
* Focus + Context - Show a timeline of total energy consumption (kW and kVAR) for the year with a radial heat map of kW energy consumption in concentric rings by apartment group for the zoomed in time window of year to look for hourly patterns of consumption.
* Hover over will show the kW and kVAR consumption.
* Explore the relationship between kW and kVAR cyclical patterns and different period types (i.e. the circle being day of week, month or year).

## Prototypes

### Dataset 1: Personal Electric Account

Below is a screenshot of a scatter plot of the data for electrical usage for my personal accounts.  I live in an owner occupied 3 family and you can see the usage for two of the apartments that I occupy and the common meter which provides power for the rear and front LED lighting, basement outlets and outside outlets.  I have electric heat pumps that I use to cool in the summer and offset oil consumption in the winter.

[Scatterplot of Personal Electric Consumption by Account](https://vizhub.com/pcordone/88ab7f8fa4404167af3b1866e3fcd70f?mode=full)
[![image](
https://user-images.githubusercontent.com/447806/133937864-d8a5d491-8e60-4cfc-a4cc-e4a9f931c23c.png)](
https://user-images.githubusercontent.com/447806/133937864-d8a5d491-8e60-4cfc-a4cc-e4a9f931c23c.png)

[Stacked Bar Chart of Personal Electric Usage Data By Year for Account](https://vizhub.com/pcordone/93f904e779964c3fa8bfa169311ebf00?edit=files&file=barChart.js&mode=full)
[![image](
https://user-images.githubusercontent.com/447806/136951147-99747773-92ad-4fac-9385-8670a5154d0a.png)](
https://user-images.githubusercontent.com/447806/136951147-99747773-92ad-4fac-9385-8670a5154d0a.png)

[Radial Stacked Bar Chart of Personal Electric Usage Data By Year for Account](https://vizhub.com/pcordone/3974ffab05d94bbdb2c24a188b87eb66?mode=full)
[![image](
https://user-images.githubusercontent.com/447806/138621014-8f3e3043-b0a7-40d1-815a-91cd3c029a21.png)](
https://user-images.githubusercontent.com/447806/138621014-8f3e3043-b0a7-40d1-815a-91cd3c029a21.png)

[Radial Stacked Bar Chart With Brushing of Personal Electric Usage Data By Year for Account](https://vizhub.com/pcordone/28aa056b1c374fb5aeb1e281a802a8bf?mode=full)
[![image](
https://user-images.githubusercontent.com/447806/139498642-09499915-6d4e-49e1-8525-d25d9cf3794c.png)](
https://user-images.githubusercontent.com/447806/139498642-09499915-6d4e-49e1-8525-d25d9cf3794c.png)
[![image](
https://user-images.githubusercontent.com/447806/139498649-1537bfb0-0557-4f05-bc27-06ad39c02116.png)](
https://user-images.githubusercontent.com/447806/139498649-1537bfb0-0557-4f05-bc27-06ad39c02116.png)
[![image](
https://user-images.githubusercontent.com/447806/139498663-d519bf4c-0e98-4e00-a3f3-40af3e5503f9.png)](
https://user-images.githubusercontent.com/447806/139498663-d519bf4c-0e98-4e00-a3f3-40af3e5503f9.png)


### Dataset 2: MFRED Dataset

#### Iteration 1: Radial Line Chart

In these plots I pivoted to the new MFRED dataset.
Below is a radial line chart of the MFRED 1 hour aggregation of the data.  I aggregated the 15 minute aggregate to an hour to make it more manageable.  The 15 min aggregation was too large to be imported into vizhub or gist.
[![image](
https://user-images.githubusercontent.com/447806/140840065-1eaf3cca-f6f1-46bd-ada9-32c2a4f4a940.png)](
https://user-images.githubusercontent.com/447806/140840065-1eaf3cca-f6f1-46bd-ada9-32c2a4f4a940.png)

#### Iteration 2: Radial Heat Map

My latest iteration grouped the data by apartment group, time of day and then calculated the average kW energy consumption for each hourly time of day and each apartment group.  Below are visualizations that show apartment group 1, apartment group 26 and all the apartment groups.  The first one used a radial line chart; however, you can see that due to the amount of data and therefore lines generated, the visualization doesn't work well.  I could try using opacity; however, there are too many lines so that won't work.
[![image](
https://user-images.githubusercontent.com/447806/141706715-2a79cd06-918c-433c-a707-453b5e2f22bd.png)](
https://user-images.githubusercontent.com/447806/141706715-2a79cd06-918c-433c-a707-453b5e2f22bd.png)

Instead I shifted to using a radial heat map of the average kW energy consumed for each time of day for each apartment group.  The darker the green the more energy that is consumed.  You can see there is quite a range between the smallest and largest apartment groups so the variation in electricity usage for time of day isn't that pronounced.  When a single apartment group is selected, the variation becomes more pronounced since the entire color range is used for a smaller kW range.  In the next iteration, I used a separate linear scale to drive the heatmap color calculation for each apartment group.

[![image](
https://user-images.githubusercontent.com/447806/141706722-a1ab9aa5-a828-4e70-adcb-87bce6921312.png)](
https://user-images.githubusercontent.com/447806/141706722-a1ab9aa5-a828-4e70-adcb-87bce6921312.png)

[![image](
https://user-images.githubusercontent.com/447806/141706723-9d4e5e9f-d1a9-4838-b0d8-fffe9940e597.png)](
https://user-images.githubusercontent.com/447806/141706723-9d4e5e9f-d1a9-4838-b0d8-fffe9940e597.png)

When each apartment group can utilize the full range of greens in the color scale, the daily usage pattern becomes more pronounced and the cyclical time of day usage patterns within an apartment group and across groups is more easily detected.
[![image](
https://user-images.githubusercontent.com/447806/141706733-d818e287-dede-4c38-abcd-48417a8f4425.png)](
https://user-images.githubusercontent.com/447806/141706733-d818e287-dede-4c38-abcd-48417a8f4425.png)

## Sketches

This visualization sketch shows a stacked bar graph wrapped around a circle representing the usage for the 12 months of the year for 3 accounts.  The rationale is that by wrapping the bar graph around a circle, the viewer can look to the opposite side of the circle to see usage patterns for the opposite season.  The visualization could also show usage for the same account with the bars closer to the origin for the first year and the bars further from the origin for the second year.  Multiple accounts could also be rendered for two consecutive years by grouping the accounts visually as groups of consecutive circles of accounts.  An issue with this visualization is that the area of segments will increase if the height of the bars represent usage.  That may be perceived as misleading since it will cause the user to believe that the outer bar segments are consuming more electricity.

[![image](https://user-images.githubusercontent.com/447806/133938224-1bc1bfc5-3cd1-439e-a079-243d89931b48.png)](https://user-images.githubusercontent.com/447806/133938224-1bc1bfc5-3cd1-439e-a079-243d89931b48.png)

By rendering the bars as rectangular instead of pie shaped, the issue of the area of the bars increasing as segments are further out is removed.
[![image](
https://user-images.githubusercontent.com/447806/133938231-ae7a1b6b-bd14-46a2-b126-a578d11f0b41.png)](
https://user-images.githubusercontent.com/447806/133938231-ae7a1b6b-bd14-46a2-b126-a578d11f0b41.png)

## Schedule of Deliverables
Week 7
* First draft of porting stacked bar chart to radial bar chart.<br>

Week 8
* Fix issues with radial stacked bar chart
  * <strike>Fix bugs with the yaxis radial labels not showing.</strike>
  * <strike>Fix the bug with the lines being overwritten by the pie wedges.</strike>
  * <strike>Get the y label text and title to showup.</strike><br>

Week 9
* <strike>Identify a richer dataset of electrical usage data and expore the data via vega lite API.</strike>
* Change the visualization from a radial stacked bar chart to a radial line chart for the new dataset.

Week 10
* Discuss in 1 on 1 with Prof. Curran ideas for how to visualize the new dataset.  Decided on binning the data to reduce the amount of data that is being visualized.  the line chart had too many overlapping lines to be meaning.  Preprocessing the data without loosing the essential features will reduce the data to a more manageable size.

Week 11
* Coded grouping data by AG and binning data by time of day.

Week 12
* Code a heatmap of the binned data above.  Add a drop down selection for choosing kVAR and kW.
* Try facet visualization of above by AG or I may try concentric heatmaps of above by AG.
* I will attempt using the javascript template for preprocessing the data that Prof. Kelleher sent me to create a grouping/binning preprocessor of the full 1 second dataset.

Week 13
* Export visualization and attempt to host it on gtihub.  If I run into too many technical problems I may abandond this effort.

Week 14
* Experiment with animations and add hover over text.

Week 15 
* Polishing touches.

## Citations
[1]C. J. Meinrenken et al., “MFRED, 10 second interval real and reactive power for groups of 390 US apartments of varying size and vintage,” Sci Data, vol. 7, no. 1, p. 375, Nov. 2020, doi: 10.1038/s41597-020-00721-w.

