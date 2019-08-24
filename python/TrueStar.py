class SchellingStars:
    def __init__(self, admin_user, market_name):
        self.max_vote = 5
        self.min_vote = 1
        self.phase = "voting"
        self.admin = admin_user
        self.name = market_name
        self.voter_commitments = dict()
        self.voter_votes = dict()
        self.voter_weights = dict()
        self.voter_withdrawn = dict()
        self.prize_pool = 0
        self.total_weight_that_voted_for_result = defaultdict(lambda : 0)
        self.prizes_already_paid = 0
        self.prizes = []    
    
    def contribute_prize(self, caller, prize, prize_amount):
        # may be called by anyone
        if self.phase == "withdraw" or self.phase == "destroyed": 
            return "error: phase should be commit or reveal"
        assert prize > 0
        self.prizes.append(prize) # accept prize
        self.prize_pool += prize_amount
        
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

    def commit_vote(self, caller, commitment):
        if self.phase != "committing": 
            return "error: phase should be committing"
        self.voter_commitments[caller] = commitment
        
    def finish_commit(self, caller):
        if self.phase != "committing": 
            return "error: phase should be committing"
        self.phase = "revealing"
        # TODO: emit event asking everyone to reveal their votes.
        
    def reveal(self, caller, (x,y)):
        if self.phase != "revealing": 
            return "error: phase should be revealing"
        if caller is in self.voter_votes:
            return "reveal already made"
        if caller not in self.voter_commitments:
            return "you did not commit a vote"
        if hash((x,y)) != self.voter_commitments[caller]:
            return "error: the commitment does not match the submitted vote"
        self.voter_votes = None # temporary
        if x > self.max_vote:
            return "vote was too large. Ignoring it."
        if x < self.min_vote:
            return "vote was too small. Ignoring it."
        if round(x) != x:
            return "vote was not an integer. Ignoring it."
        self.voter_votes[caller] = x
        self.total_vote_sum_tallied += x * self.voter_weight[caller]
        self.total_vote_weight_cast += self.voter_weight[caller] # possible alterntive: make this unweighted, so that everyone's vote is counted the same
        if x not in self.total_weight_that_voted_for_result:
            self.total_weight_that_voted_for_result[x] = 0
        self.total_weight_that_voted_for_result[x] += self.voter_weight[caller]
        
    def finish_reveal(self, caller)
        # need minimum timestamp here
        if self.phase != "revealing": 
            return "error: phase should be revealing"
        self.phase = "withdrawing"
        self.correct_result = round(self.total_vote_sum_tallied / self.total_vote_weight_cast)   
        self.total_winners_weight = self.total_weight_that_voted_for_result[self.correct_result]
        if self.total_winners_weight != 0: # if all are 0, no one won. Destroy can be called right away for all we care.
            self.prize_pool_winners_multiplier_helper = self.voter_weight[caller] / self.total_winners_weight
        # TODO: make an emit step with the final vote count and final rating and everything else
        
    def challenge_hash(self, caller, challenged_user, (x,y)):
        # purpose of this is to incentive 3rd-party apps to defend their value of y.
        if challenged_user == caller:
            return "you can't challenge yourself"
        if self.phase != "committing": 
            return "error: phase should be committing"
        if hash((x,y)) == self.voter_commitments[user]:
            weight = self.voter_weights[user] / 2
            self.voter_weights[user] = 0
            self.add_voter(caller, weight / 2)
        
    def withdraw_prize(self, caller):
        if caller not in self.voter_weight or self.voter_weight[caller] == 0:
            return "error: the admin did not register you as a participant in this market"            
        assert self.voter_weight[caller] > 0
        if self.phase != "withdrawing": 
            return "error: phase should be withdrawing"
        if self.voter_withdrawn[caller]:
            return "already withdrawn"        
        if self.voter_votes[caller] != self.correct_result:
            return
        self.voter_withdrawn[caller] = True
        # TODO: make sure ppl voted !!!!
        prize = self.prize_pool * self.prize_pool_winners_multiplier_helper
        self.prizes_already_paid += prize
        if self.prizes_already_paid < self.prize_pool:
            # transfer prize to winner
        
    def destroy(self, caller):
        if self.phase != "withdrawing": 
            return "error: phase should be withdrawing"
        self.phase = "destroyed"
        # transfer all remaining assets back to the admin
        # emit "no more withdrawals permitted
        
