# Benchmarks

## Test Setup

To benchmark Errsole against Elasticsearch and Amazon CloudWatch, we conducted tests under the following setup:

1. **Node.js Application:**
    * **Instance Type:** r7g.medium EC2 Instance
    * **Specifications:** 1 CPU, 8 GB RAM
2. **MySQL Server:**
    * **Instance Type:** m5.large EC2 Instance
    * **Specifications:** 2 CPUs, 8 GB RAM
3. **PostgreSQL Server:**
    * **Instance Type:** m5.large EC2 Instance
    * **Specifications:** 2 CPUs, 8 GB RAM
4. **MongoDB Server:**
    * **Instance Type:** m5.large EC2 Instance
    * **Specifications:** 2 CPUs, 8 GB RAM
5. **Elasticsearch Server:**
    * **Instance Type:** m5.large EC2 Instance
    * **Specifications:** 2 CPUs, 8 GB RAM
6. **Load Testing Tool:** Grafana K6

## Elasticsearch

We tested the following configurations:

1. **Winston + Elasticsearch:** Configured the Node.js app with Winston for logging and Elasticsearch as the storage backend.
2. **Pino + Elasticsearch:** Configured the Node.js app with Pino for logging and Elasticsearch as the storage backend.
3. **Errsole + SQLite:** Configured the Node.js app with Errsole for logging and SQLite as the storage backend.
4. **Errsole + MySQL:** Configured the Node.js app with Errsole for logging and MySQL as the storage backend.
5. **Errsole + PostgreSQL:** Configured the Node.js app with Errsole for logging and PostgreSQL as the storage backend.
6. **Errsole + MongoDB:** Configured the Node.js app with Errsole for logging and MongoDB as the storage backend.

### Results

Errsole demonstrated a significant performance advantage, handling 70,000 - 90,000 more requests per minute compared to Elasticsearch configurations.

| **Test No.** 	| **Pino + Elasticsearch** 	| **Winston + Elasticsearch** 	| **Errsole + MongoDB** 	| **Errsole + MySQL** 	| **Errsole + PostgreSQL** 	| **Errsole + SQLite** 	|
|--------------	|--------------------------	|-----------------------------	|-----------------------	|---------------------	|--------------------------	|----------------------	|
| 1            	| 265363                   	| 268917                      	| 340490                	| 349623              	| 360264                   	| 370499               	|
| 2            	| 265160                   	| 273568                      	| 338163                	| 352383              	| 360785                   	| 362611               	|
| 3            	| 272862                   	| 274449                      	| 338963                	| 351421              	| 364411                   	| 364310               	|
| 4            	| 259297                   	| 270090                      	| 337759                	| 350173              	| 367953                   	| 361347               	|
| 5            	| 263454                   	| 271782                      	| 340265                	| 350188              	| 367309                   	| 362578               	|
| **Average**  	| **265227**               	| **271761**                  	| **339128**            	| **350758**          	| **364144**               	| **364269**           	|

<img src="https://github.com/user-attachments/assets/e193e016-a14a-46c1-92af-865b3be27df4" alt="errsole-vs-elasticsearch-benchmarks" width="800">

## Amazon CloudWatch

We also conducted tests comparing the performance of Errsole with Amazon CloudWatch:

1. **Winston + CloudWatch:** Configured the Node.js app with Winston for logging and CloudWatch as the storage backend.

2. **Pino + CloudWatch:** Configured the Node.js app with Pino for logging and CloudWatch as the storage backend.

### Results

Errsole significantly outperformed all CloudWatch configurations in benchmark tests. It handled 280,000 - 300,000 more requests per minute than direct CloudWatch and 40,000 - 70,000 more requests per minute than Pino + CloudWatch. Notably, Winston + CloudWatch failed in all test scenarios.

| **Test No.** 	| **CloudWatch** 	| **Winston + CloudWatch** 	| **Pino + CloudWatch** 	| **Errsole + MongoDB** 	| **Errsole + MySQL** 	| **Errsole + PostgreSQL** 	| **Errsole + SQLite** 	|
|--------------	|----------------	|--------------------------	|-----------------------	|-----------------------	|---------------------	|--------------------------	|----------------------	|
| 1            	| 54185          	| Failed                   	| 296752                	| 340490                	| 349623              	| 360264                   	| 370499               	|
| 2            	| 55126          	| Failed                   	| 290988                	| 338163                	| 352383              	| 360785                   	| 362611               	|
| 3            	| 54932          	| Failed                   	| 301431                	| 338963                	| 351421              	| 364411                   	| 364310               	|
| 4            	| 54859          	| Failed                   	| 292222                	| 337759                	| 350173              	| 367953                   	| 361347               	|
| 5            	| 55239          	| Failed                   	| 294272                	| 340265                	| 350188              	| 367309                   	| 362578               	|
| **Average**  	| **54868**      	| **Failed**               	| **295133**            	| **339128**            	| **350758**          	| **364144**               	| **364269**           	|

## Benchmarks Code

To access the benchmarks code, visit [https://github.com/errsole/errsole.js/tree/master/benchmarks](https://github.com/errsole/errsole.js/tree/master/benchmarks).

## Main Documentation

[Main Documentation](/README.md)
