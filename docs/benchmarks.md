# Benchmarks

## Test Setup

To benchmark Errsole against Elasticsearch, we conducted tests under the following setup:

1. **Node.js Application:**
    * **Instance Type:** r7g.medium EC2 Instance
    * **Specifications:** 1 CPU, 8 GB RAM
2. **MySQL Server:**
    * **Instance Type:** m5.large EC2 Instance
    * **Specifications:** 2 CPUs, 8 GB RAM
3. **Elasticsearch Server:**
    * **Instance Type:** m5.large EC2 Instance
    * **Specifications:** 2 CPUs, 8 GB RAM
4. **Load Testing Tool:** Grafana K6

## Elasticsearch

We conducted load testing under three different configurations to compare performance:

1. **Winston + Elasticsearch:**

    Configured the Node.js app with Winston for logging and Elasticsearch as the storage backend.

2. **Pino + Elasticsearch:**

    Configured the Node.js app with Pino for logging and Elasticsearch as the storage backend.

3. **Errsole + MySQL:**

    Configured the Node.js app with Errsole for logging and MySQL as the storage backend.

### Results

Errsole demonstrated a significant performance advantage, handling 79k-85k more requests per minute compared to Elasticsearch configurations.

| **Test No.** 	| **Pino + Elasticsearch** 	| **Winston + Elasticsearch** 	| **Errsole + MySQL** 	|
|--------------	|--------------------------	|-----------------------------	|---------------------	|
| 1            	| 265363                   	| 268917                      	| 349623              	|
| 2            	| 265160                   	| 273568                      	| 352383              	|
| 3            	| 272862                   	| 274449                      	| 351421              	|
| 4            	| 259297                   	| 270090                      	| 350173              	|
| 5            	| 263454                   	| 271782                      	| 350188              	|
| **Average**     | **265227**                  | **271761**                     | **350758**            |

<img src="https://github.com/user-attachments/assets/14eb3290-a2d5-4365-8926-532120e2c6c5" alt="errsole-vs-elasticsearch-benchmarks" width="800">

## Amazon CloudWatch

We also conducted tests comparing the performance of Errsole with Amazon CloudWatch.

1. **Winston + CloudWatch:**

    Configured the Node.js app with Winston for logging and CloudWatch as the storage backend.

2. **Pino + CloudWatch:**

    Configured the Node.js app with Pino for logging and CloudWatch as the storage backend.

3. **Errsole + MySQL:**

    Configured the Node.js app with Errsole for logging and MySQL as the storage backend.

### Results

Errsole handled 55k more requests per minute compared to CloudWatch configurations. Notably, Winston + CloudWatch failed in all test scenarios.

| **Test No.** 	| **CloudWatch** 	| **Winston + CloudWatch** 	| **Pino + CloudWatch** 	| **Errsole + MySQL** 	|
|--------------	|----------------	|--------------------------	|-----------------------	|---------------------	|
| 1            	| 54185          	| Failed                   	| 296752                	| 349623              	|
| 2            	| 55126          	| Failed                   	| 290988                	| 352383              	|
| 3            	| 54932          	| Failed                   	| 301431                	| 351421              	|
| 4            	| 54859          	| Failed                   	| 292222                	| 350173              	|
| 5            	| 55239          	| Failed                   	| 294272                	| 350188              	|
| **Average**  	| **54868**      	| **Failed**               	| **295133**            	| **350758**          	|

## Benchmarks Code

To access the benchmarks code, visit [https://github.com/errsole/errsole.js/tree/master/benchmarks](https://github.com/errsole/errsole.js/tree/master/benchmarks).

## Main Documentation

[Main Documentation](/README.md)
