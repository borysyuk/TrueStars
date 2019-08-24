import math

class SchellingStars:
    def __init__(self, admin_user, market_name):
        self.max_vote = 5
        self.phase = "committing"
        self.admin = admin_user
        self.name = market_name
        self.voter_commitments = dict()
        self.voter_votes = dict()
        self.voter_weights = dict()
        self.voter_withdrawn = dict()
        self.prize_pool = 0.0
        self.total_weight_that_voted_for_result = dict()
        self.prizes_already_paid = 0.0
        self.total_vote_sum_tallied = 0.0
        self.total_vote_weight_cast = 0.0
    
    def contribute_prize(self, caller, prize):
        # may be called by anyone
        if self.phase == "withdraw" or self.phase == "destroyed": 
            return "error: phase should be commit or reveal"
        assert prize > 0
        if prize > balances[caller]:
            return "error: not enough funds"
        balances[caller] -= prize
        balances["contract"] += prize
        self.prize_pool += prize
        
    def add_voter(self, caller, voter, voter_weight):
        assert voter_weight > 0
        if caller != self.admin:
            return "error: caller is not admin"
        if voter_weight <= 0:
            return "error: weight should be > 0"
        if self.phase != "committing": 
            return "error: phase should be committing"
        if voter not in self.voter_weights:
            self.voter_weights[voter] = 0 # or use defaultdict
        self.voter_weights[voter] += voter_weight
        self.voter_commitments[voter] = None
        self.voter_votes[voter] = None
        self.voter_withdrawn[voter] = False

    def commit_vote(self, caller, commitment):
        if self.phase != "committing": 
            return "error: phase should be committing"
        self.voter_commitments[caller] = commitment
        
    def finish_commit(self, caller):
        if caller != self.admin:
            return "error: caller is not admin"
        if self.phase != "committing": 
            return "error: phase should be committing"
        self.phase = "revealing"
        # TODO: emit event asking everyone to reveal their votes.
        
    def reveal(self, caller, (x,y)):
        if self.phase != "revealing": 
            return "error: phase should be revealing"
        if caller in self.voter_votes and self.voter_votes[caller] is not None:
            return "reveal already made"
        if caller not in self.voter_commitments:
            return "you did not commit a vote"
        if hash((x,y)) != self.voter_commitments[caller]:
            return "error: the commitment does not match the submitted vote"
        self.voter_votes[caller] = None # temporary
        if x > self.max_vote:
            return "vote was too large. Ignoring it."
        if x < 1:
            return "vote was too small. Ignoring it."
        if round(x) != x:
            return "vote was not an integer. Ignoring it."
        self.voter_votes[caller] = x
        self.total_vote_sum_tallied += x * self.voter_weights[caller]
        self.total_vote_weight_cast += self.voter_weights[caller] # possible alterntive: make this unweighted, so that everyone's vote is counted the same
        if x not in self.total_weight_that_voted_for_result:
            self.total_weight_that_voted_for_result[x] = 0.0
        self.total_weight_that_voted_for_result[x] += self.voter_weights[caller]
        
    def finish_reveal(self, caller):
        if caller != self.admin:
            return "error: caller is not admin"
        if self.phase != "revealing": 
            return "error: phase should be revealing"
        self.phase = "withdrawing"
        if self.total_vote_sum_tallied == 0 or self.total_vote_weight_cast == 0:
            self.correct_result = None
            self.total_winners_weight = 0.0
        else:            
            self.correct_result = math.floor(0.5 + self.total_vote_sum_tallied / self.total_vote_weight_cast)   
            self.total_winners_weight = self.total_weight_that_voted_for_result[self.correct_result]
            if self.total_winners_weight != 0: # if all are 0, no one won. Destroy can be called right away for all we care.
                self.prize_pool_winners_multiplier_helper = self.prize_pool / self.total_winners_weight
        # TODO: make an emit step with the final vote count and final rating and everything else
        
    def challenge_hash(self, caller, challenged_user, (x,y)):
        # purpose of this is to incentive 3rd-party apps to defend their value of y.
        if challenged_user == caller:
            return "you can't challenge yourself"
        if self.phase != "committing": 
            return "error: phase should be committing"
        if hash((x,y)) == self.voter_commitments[user]:
            weight = self.voter_weights[user] / 2
            self.voter_weights[user] = 0.0
            self.add_voter(caller, weight / 2)
        
    def withdraw_prize(self, caller):
        if caller not in self.voter_weights or self.voter_weights[caller] == 0:
            return "error: the admin did not register you as a participant in this market"            
        assert self.voter_weights[caller] > 0
        if self.phase != "withdrawing": 
            return "error: phase should be withdrawing"
        if self.voter_withdrawn[caller]:
            return "already withdrawn"        
        if self.voter_votes[caller] is None or self.voter_votes[caller] != self.correct_result:
            return "you did not win, so nothing to withdraw"
        self.voter_withdrawn[caller] = True
        # TODO: make sure ppl voted !!!!
        prize = self.voter_weights[caller] * self.prize_pool_winners_multiplier_helper
        self.prizes_already_paid += prize
        self.prize_pool -= prize
        balances["contract"] -= prize
        balances[caller] += prize
        if self.prizes_already_paid < self.prize_pool:
            pass # transfer prize to winner
        
    def destroy(self, caller):
        if caller != self.admin:
            return "error: caller is not admin"
        if self.phase != "withdrawing": 
            return "error: phase should be withdrawing"
        self.phase = "destroyed"
        remaining_balance = balances["contract"]
        assert remaining_balance >= 0
        balances["contract"] = 0
        balances[self.admin] += remaining_balance
        # emit "no more withdrawals permitted
        

users = {"uber", "1", "2", "3", "contract"}
balances = {x : 0 for x in users}
balances["uber"] = 1000.0

market = SchellingStars("uber", "hello market")
print market.contribute_prize("uber", 1)
print market.add_voter("uber", "1", 2.0)
print market.add_voter("uber", "2", 15.0)
print market.add_voter("uber", "1", 8.0)
print market.add_voter("uber", "3", 5.0)
print market.commit_vote("1", hash((2, "weoifnwaoifen")))
print market.commit_vote("2", hash((1, "ouwbvib")))
print market.commit_vote("3", hash((2, "qIUFDGOIUF")))
print market.finish_commit("uber")
print market.reveal("1", (2, "weoifnwaoifen"))
print market.reveal("2", (1, "ouwbvib"))
print market.reveal("3", (2, "qIUFDGOIUF"))
print market.finish_reveal("uber")
print market.withdraw_prize("1")
print market.withdraw_prize("2")
print market.withdraw_prize("3")
print market.destroy("uber")
