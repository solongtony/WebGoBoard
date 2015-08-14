(function(){

/*
Check Stones for membership in a group of stones of the same color.
Check stones for attack by stones of a different color.

Diagram of some stones on a traditional board.
The influence circle must intersect another stone
in order to attack it or join a group of stones.

   |      |
   -      -
  /|\    /|\
-|-+-|--|-+-|-
  \|/    \|/
   -      -
   |      |
   |      |
   -      -
  /|\    /|\
-|-+-|--|-+-|-
  \|/    \|/
   -      -
   |      |

*/

var NUM_FREEDOMS = 4;

function findAttackers() {

}

function findConnectedStones() {
    // For both attackers and groups.
    // It may not be necessary to FIND
    // these if state is properly UPDATED
    // AND TRACKED as stones are placed.
}

})()
