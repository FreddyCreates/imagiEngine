import sys
import json

def get_npc_behavior(position, player_position, npc_type):
    # Determine behavior state
    distance = sum((player_position[i] - position[i])**2 for i in range(3))**0.5
    state = "idle"
    if distance < 10:
        state = "aggressive"
    
    # Simple movement towards player
    direction = [(player_position[i] - position[i]) / max(distance, 0.1) for i in range(3)]
    
    # Storyline integration: Fragments of memory
    if npc_type == 'basic':
        dialogues = {
            "idle": "Why... is the sky... broken?",
            "aggressive": "You! You are the one who corrupted us!"
        }
    else:
        dialogues = {
            "idle": "System... failing...",
            "aggressive": "ERASE! ERASE! ERASE!"
        }
        
    return {
        "move": direction if state == "aggressive" else [0, 0, 0],
        "state": state,
        "dialogue": dialogues.get(state, "...")
    }

if __name__ == "__main__":
    # Simulate receiving data from the node server
    data = json.loads(sys.stdin.read())
    behavior = get_npc_behavior(data["position"], data["player_position"], data.get("type", "basic"))
    print(json.dumps(behavior))
