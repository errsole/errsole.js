# Benchmarks

Errsole outperforms Elasticsearch by 80k requests per minute.

### Test Setup

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

### Load Testing Scenarios

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
| Average      	| 265227                   	| 271761                      	| 350758              	|

<img src="https://github.com/user-attachments/assets/14eb3290-a2d5-4365-8926-532120e2c6c5" alt="errsole-vs-elasticsearch-benchmarks" width="800">

To access the benchmark code, visit [https://github.com/errsole/errsole.js/tree/master/benchmarks](https://github.com/errsole/errsole.js/tree/master/benchmarks).

### Main Documentation

[Main Documentation](/README.md)
