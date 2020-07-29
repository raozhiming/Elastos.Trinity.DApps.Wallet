import { WalletManagerPage } from '../pages/wallet/wallet-manager/wallet-manager.page';
import { WalletManager } from '../services/wallet.service';
import { StandardCoinName } from './Coin';

enum VoteType {
    CRC = "CRC",
    Delegate = "Delegate",
    CRCImpeachment = "CRCImpeachment",
    CRCProposal = "CRCProposal"
}

type InvalidCRCCandidate = string;
type InvalidDelegateCandidate = string;
type InvalidCRCImpeachmentCandidate = string;
type InvalidCRCProposalCandidate = string;

/**
 * Example:
    {
        "Type":"CRC",
        "Candidates":[ "cid", ...]
    },
    {
        "Type":"Delegate",
        "Candidates":[ "pubkey", ...]
    },
    {
        "Type":"CRCImpeachment",
        "Candidates":[ "cid", ...]
    }
 */
export type InvalidCandidateForVote = {
    Type: VoteType,
    Candidates: InvalidCRCCandidate[] | InvalidDelegateCandidate[] | InvalidCRCImpeachmentCandidate[] | InvalidCRCProposalCandidate[]
}

/**
 * Helper class to computer the list of previous votes that are now invalid. It's important to give a list
 * of invalid candidates to the SPV API so it can cleanup those now-wrong previous votes when merging our new
 * vote with previous vote types. Otherwise, the published transaction will be invalid, if we pass invalid candidates.
 */
export class InvalidVoteCandidatesHelper {
    constructor(private walletManager: WalletManager, private masterWalletId: string) {}

    public async computeInvalidCandidates(): Promise<InvalidCandidateForVote[]> {
        let invalidCandidatesList: InvalidCandidateForVote[] = [];

        // Check if some previously voted dpos nodes are now invalid
        // TODO

        // Check if some previously voted proposals are not in NOTIFICATION state any more
        let invalidProposals = await this.computeInvalidProposals();
        invalidCandidatesList.push(invalidProposals);

        // Check if a previously voted CR member has been impeached and is not a CR member any more
        // TODO

        // Check if we are outside of the council voting period.
        // TODO

        return invalidCandidatesList;
    }

    /*
    ORIGINAL CODE FROM THE ELA WALLET:
    
    public JSONArray conversUnactiveVote(String remove, String voteInfo, List<VoteListBean.DataBean.ResultBean.ProducersBean> depositList,
                                         List<CRListBean.DataBean.ResultBean.CrcandidatesinfoBean> crcList, List<ProposalSearchEntity.DataBean.ListBean> voteList, List<CtListBean.Council> councilList) {
        JSONArray otherUnActiveVote = new JSONArray();

        if (!TextUtils.isEmpty(voteInfo) && !voteInfo.equals("null") && !voteInfo.equals("[]")) {

            try {
                JSONArray lastVoteInfo = new JSONArray(voteInfo);
                for (int i = 0; i < lastVoteInfo.length(); i++) {
                    JSONObject jsonObject = lastVoteInfo.getJSONObject(i);
                    String type = jsonObject.getString("Type");

                    if (type.equals(remove)) {
                        continue;
                    }
                    JSONObject votes = jsonObject.getJSONObject("Votes");
                    Iterator it = votes.keys();
                    JSONArray candidates = new JSONArray();
                    switch (type) {
                        case "Delegate":
                            while (it.hasNext()) {
                                String key = (String) it.next();
                                if (depositList == null || depositList.size() == 0) {
                                    candidates.put(key);
                                    continue;
                                }
                                for (VoteListBean.DataBean.ResultBean.ProducersBean bean : depositList) {
                                    if (bean.getOwnerpublickey().equals(key) && !bean.getState().equals("Active")) {
                                        candidates.put(key);
                                        break;
                                    }
                                }
                            }

                            break;
                        case "CRC":
                            while (it.hasNext()) {
                                String key = (String) it.next();
                                if (crcList == null || crcList.size() == 0) {
                                    candidates.put(key);
                                    continue;
                                }
                                for (CRListBean.DataBean.ResultBean.CrcandidatesinfoBean bean : crcList) {
                                    if (bean.getDid().equals(key) && !bean.getState().equals("Active")) {
                                        candidates.put(key);
                                        break;
                                    }
                                }
                            }

                            break;
                        case "CRCImpeachment"://弹劾
                            while (it.hasNext()) {
                                String key = (String) it.next();
                                if (councilList == null || councilList.size() == 0) {
                                    candidates.put(key);
                                    continue;
                                }
                                for (CtListBean.Council bean : councilList) {
                                    if (bean.getDid().equals(key) && !bean.getStatus().equals("Elected")) {
                                        candidates.put(key);
                                        break;
                                    }
                                }
                            }
                            break;
                        case "CRCProposal":
                            while (it.hasNext()) {
                                String key = (String) it.next();
                                if (crcList == null || crcList.size() == 0) {
                                    candidates.put(key);
                                    continue;
                                }
                                for (ProposalSearchEntity.DataBean.ListBean bean : voteList) {
                                    if (bean.getProposalHash().equals(key) && !bean.getStatus().equals("NOTIFICATION")) {
                                        candidates.put(key);
                                        break;
                                    }
                                }
                            }
                            break;


                    }
                    otherUnActiveVote.put(getActiveJson(type, candidates));
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
        return otherUnActiveVote;
    } 
    */

    private async computeInvalidProposals(): Promise<InvalidCandidateForVote> {
        // Retrieve previous vote info
        let previousVoteInfo = await this.walletManager.spvBridge.getVoteInfo(this.masterWalletId, StandardCoinName.ELA, VoteType.CRCProposal);
        console.log("previousVoteInfo", previousVoteInfo);

        // TODO

        return {
            Type: VoteType.CRCProposal,
            Candidates: []
        }
    } 
}