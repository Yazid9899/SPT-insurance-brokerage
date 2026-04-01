 ## 1) Read in this order (high leverage)                                                                                               

  1. Product/domain: [PRD.md](C:\GOOD LUCK\SPT-insurance-brokerage\PRD.md)                                                               
  2. Data model: [schema.prisma](C:\GOOD LUCK\SPT-insurance-brokerage\prisma\schema.prisma)
  3. Validation/contracts: [validations.ts](C:\GOOD LUCK\SPT-insurance-brokerage\src\lib\validations.ts)                                 
  4. Core domain rules:                                                                                                                  

  - [status-transitions.ts](C:\GOOD LUCK\SPT-insurance-brokerage\src\lib\status-transitions.ts)                                          
  - [settlement-service.ts](C:\GOOD LUCK\SPT-insurance-brokerage\src\lib\settlement-service.ts)                                          
  - [reports-service.ts](C:\GOOD LUCK\SPT-insurance-brokerage\src\lib\reports-service.ts)                                                
                                                                                                                                         
  5. Route handlers: src/app/api/**/route.ts                                                                                             
  6. Auth/middleware:                                                                                                                    
                                                                                                                                         
  - [auth.ts](C:\GOOD LUCK\SPT-insurance-brokerage\src\lib\auth.ts)                                                                      
  - [middleware.ts](C:\GOOD LUCK\SPT-insurance-brokerage\src\middleware.ts)                                                              
                                                                                                                                         
  ## 2) Build a mental model (write this down)                                                                                           
                                                                                                                                         
  For each feature (cases, open-covers, settlements, reports):
                                                                                                                                         
  - Entry route                                                                                                                          
  - Zod schema used                                                                                                                      
  - Service/domain function called                                                                                                       
  - Prisma tables touched                                                                                                                
  - State transitions/invariants
  - Error/status codes returned                                                                                                          
                                                                                                                                         
  If you can fill this table, you understand the system.                                                                                 
                                                                                                                                         
  ## 3) Learn through tests (fastest path)                                                                                               
                                                                                                                                         
  Run and study these groups:                                                                                                            
                                                                                                                                         
  - tests/integration/cases/*                                                                                                            
  - tests/integration/open-covers/*                                                                                                      
  - tests/integration/settlements/*                                                                                                      
  - tests/integration/reports/*                                                                                                          
  - tests/unit/lib/status-transitions.test.ts                                                                                            
  - tests/unit/lib/settlement-number.test.ts                                                                                             
  - tests/unit/lib/reports-aggregation.test.ts                                                                                           
                                                                                                                                         
  Tests show intended behavior, edge cases, and contract shape better than docs.                                                         
                                                                                                                                         
  ## 4) Review workflow you should use every PR                                                                                          
                                                                                                                                         
  1. Check schema/migration impact first.                                                                                                
  2. Check Zod changes second.                                                                                                           
  3. Check domain-service logic third.                                                                                                   
  4. Check route response/error consistency.                                                                                             
  5. Verify tests cover new invariants + failure paths.                                                                                  
  6. Run focused integration tests for touched module.                                                                                   
                                                                                                                                         
  ## 5) What to master first (critical in this codebase)                                                                                 
                                                                                                                                         
  - Number generation and concurrency (case-number, settlement-number)                                                                   
  - Settlement confirm/pay invariants                                                                                                    
  - Bulk-upload flow and temp document lifecycle                                                                                         
  - Report query scalability (filters/sort/pagination)                                                                                   
  - API consistency (apiError, status codes, auth behavior