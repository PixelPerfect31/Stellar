#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, log};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TipEvent {
    pub sender: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contract]
pub struct TipJarContract;

#[contractimpl]
impl TipJarContract {
    /// Accepts a tip from a user, updates the total tips, and emits a "tip_received" event.
    pub fn deposit(env: Env, sender: Address, amount: i128) -> i128 {
        // Enforce sender authorization
        sender.require_auth();

        if amount <= 0 {
            panic!("Amount must be a positive number greater than 0");
        }

        // Get current total tips
        let total_key = symbol_short!("total");
        let mut total: i128 = env.storage().instance().get(&total_key).unwrap_or(0);
        
        // Increase total tips
        total += amount;
        env.storage().instance().set(&total_key, &total);
        
        // Extend TTL to keep instance storage alive
        env.storage().instance().extend_ttl(100, 100);

        // Emit a "tip_received" event containing: sender address, amount, and timestamp
        let event_key = Symbol::new(&env, "tip_received");
        env.events().publish(
            (event_key, sender.clone()),
            TipEvent {
                sender: sender.clone(),
                amount,
                timestamp: env.ledger().timestamp(),
            },
        );

        log!(&env, "Tip received from {}: {}, new total is {}", sender, amount, total);
        
        total
    }

    /// Returns the total tipped amount in the jar.
    pub fn get_total(env: Env) -> i128 {
        let total_key = symbol_short!("total");
        env.storage().instance().get(&total_key).unwrap_or(0)
    }
}
