#RoomOccupancyGantt

This is an Angular and Express based Web-Application to prepare and display data from a CSV-File.

**Using:**
+Angular 5
+Express
+AmCharts

the data structur in the CSV-File called **RoomOccupancy.csv**
(you can change this in the ```config.json```) have to look like this:

` | Raum  |  Von  |  Bis  |
  | :---: | :---: | :---: |
  | Room1 | 13:00 | 15:00 |
  | Room1 | 09:00 | 10:00 |
  | Room2 | 08:30 | 16:00 |
  | Room3 | 07:00 | 13:00 |
 `

to use another data, you have to change the **server.js**.

>special Thanks to @martinsaigger
