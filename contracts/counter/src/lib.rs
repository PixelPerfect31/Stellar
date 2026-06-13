#![no_std]
use soroban_sdk::{contract, contractimpl, log, Env, Symbol};

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    pub fn increment(env: Env) -> u32 {
        let count_key = Symbol::new(&env, "count");
        let mut count: u32 = env.storage().instance().get(&count_key).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&count_key, &count);
        env.storage().instance().extend_ttl_info(100, 100);
        log!(&env, "Current count is {}", count);
        count
    }

    pub fn get_count(env: Env) -> u32 {
        let count_key = Symbol::new(&env, "count");
        env.storage().instance().get(&count_key).unwrap_or(0)
    }
}
